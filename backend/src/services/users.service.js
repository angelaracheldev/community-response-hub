const bcrypt = require('bcrypt');
const usersRepository = require('../repositories/users.repository');
const verificationsRepository = require('../repositories/verifications.repository');

const DEFAULT_ADMIN_CREATED_PASSWORD = 'TemporaryWelcome2026!';

async function createUser(body) {
  const roleId = Number(body.role_id);
  const role = await usersRepository.findRoleById(roleId);
  if (!role.rowCount) {
    return { error: { status: 400, body: { status: 'error', message: 'Invalid role_id' } } };
  }

  const roleName = role.rows[0].role_name;
  if (!['resident', 'responder'].includes(roleName)) {
    return { error: { status: 400, body: { status: 'error', message: 'Only residents and responders can be created here' } } };
  }

  const existing = await usersRepository.findUserIdByEmail(body.email);
  if (existing.rowCount) {
    return { error: { status: 400, body: { status: 'error', message: 'Email address is already registered.' } } };
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(body.password || DEFAULT_ADMIN_CREATED_PASSWORD, salt);
  const result = await usersRepository.insertUser({
    roleId,
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    passwordHash,
    salt,
    phoneNumber: body.phone_number,
    address: body.address,
    isVerified: true,
  });

  return {
    status: 201,
    body: {
      status: 'ok',
      message: 'User created successfully',
      user: result.rows[0],
      temporaryPassword: body.password ? undefined : DEFAULT_ADMIN_CREATED_PASSWORD,
      timestamp: new Date().toISOString(),
    },
  };
}

async function listUsers(query) {
  const filters = [];
  const params = [];

  if (query.roleId) {
    params.push(query.roleId);
    filters.push(`u.role_id = $${params.length}`);
  }
  if (query.isActive) {
    params.push(query.isActive === 'true');
    filters.push(`u.is_active = $${params.length}`);
  }
  if (query.verificationStatus) {
    params.push(query.verificationStatus.toLowerCase());
    filters.push(`COALESCE(rv.status, 'not_submitted') = $${params.length}`);
  }

  const result = await usersRepository.listUsers({ filters, params });
  return {
    body: {
      status: 'ok',
      count: result.rowCount,
      users: result.rows,
      timestamp: new Date().toISOString(),
    },
  };
}

async function getUserById(id, requestUser) {
  const result = await usersRepository.findUserById(id);
  if (!result.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'User not found' } } };
  }
  if (requestUser.role_name !== 'admin' && requestUser.user_id !== id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }
  return {
    body: { status: 'ok', user: result.rows[0], timestamp: new Date().toISOString() },
  };
}

async function updateUser(id, requestUser, body) {
  if (requestUser.role_name !== 'admin' && requestUser.user_id !== id) {
    return { error: { status: 403, body: { status: 'error', message: 'Forbidden' } } };
  }

  const updates = [];
  const params = [];
  const fields = ['first_name', 'last_name', 'phone_number', 'address', 'profile_image_url'];
  fields.forEach((field) => {
    if (body[field] !== undefined) {
      params.push(body[field]);
      updates.push(`${field} = $${params.length}`);
    }
  });

  if (!updates.length) {
    return { error: { status: 400, body: { status: 'error', message: 'No fields to update' } } };
  }

  params.push(id);
  const result = await usersRepository.updateUser({ updates, params, id });
  return {
    body: {
      status: 'ok',
      user: result.rows[0],
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
    },
  };
}

async function submitVerification(requestUser, { verificationType, documentUrl, address }) {
  const existing = await verificationsRepository.findVerificationByUserId(requestUser.user_id);
  const resolvedAddress = address || requestUser.address;

  if (existing.rowCount) {
    await verificationsRepository.updateVerification({
      verificationType,
      documentUrl,
      address: resolvedAddress,
      userId: requestUser.user_id,
    });
  } else {
    await verificationsRepository.insertVerification({
      userId: requestUser.user_id,
      verificationType,
      documentUrl,
      address: resolvedAddress,
    });
  }

  return {
    body: { status: 'ok', message: 'Verification submitted successfully', timestamp: new Date().toISOString() },
  };
}

async function reviewVerification(id, reviewerUserId, verificationStatus, remarks) {
  const user = await usersRepository.findUserIdOnly(id);
  if (!user.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'User not found' } } };
  }

  const verification = await verificationsRepository.findVerificationByUserId(id);
  if (!verification.rowCount) {
    return { error: { status: 404, body: { status: 'error', message: 'No verification request found' } } };
  }

  await verificationsRepository.reviewVerification({
    verificationStatus,
    reviewedBy: reviewerUserId,
    userId: id,
    remarks,
  });

  await verificationsRepository.setUserVerified(id, verificationStatus === 'approved');

  return {
    body: { status: 'ok', message: 'Verification reviewed successfully', timestamp: new Date().toISOString() },
  };
}

async function activateUser(id) {
  await usersRepository.setUserActive(id, true);
  return {
    body: { status: 'ok', message: 'User activated successfully', timestamp: new Date().toISOString() },
  };
}

async function deactivateUser(id) {
  await usersRepository.setUserActive(id, false);
  return {
    body: { status: 'ok', message: 'User deactivated successfully', timestamp: new Date().toISOString() },
  };
}

async function createUser(adminUser, userData) {
  const { fullName, role, email, password, phoneNumber, address, documentUrl } = userData;

  const existing = await authRepository.findUserIdByEmail(email);
  if (existing.rowCount) {
    return { error: { status: 400, body: { status: 'error', message: 'Email already registered' } } };
  }

  const roleResult = await authRepository.findRoleIdByName(role);
  if (!roleResult.rowCount) {
    return { error: { status: 400, body: { status: 'error', message: 'Invalid role' } } };
  }
  const roleId = roleResult.rows[0].role_id;

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

  const isResident = role === 'resident';

  const userResult = await usersRepository.insertUser({
    roleId,
    firstName,
    lastName,
    email,
    passwordHash,
    salt,
    phoneNumber,
    address,
    isVerified: isResident, // Residents created by admin are automatically verified
    isActive: true,
  });

  const newUser = userResult.rows[0];

  if (isResident && documentUrl) {
    await verificationsRepository.insertApprovedVerification({
      userId: newUser.user_id,
      verificationType: 'Admin Manual Creation',
      documentUrl,
      address,
      reviewedBy: adminUser.user_id,
    });
  }

  return {
    status: 201,
    body: {
      status: 'ok',
      message: 'User account created successfully. Please provide the login credentials to the user and advise them to change their password immediately after logging in.',
      user: newUser,
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  submitVerification,
  reviewVerification,
  activateUser,
  deactivateUser,
  createUser,
};
