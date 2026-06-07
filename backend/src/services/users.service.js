const usersRepository = require('../repositories/users.repository');
const verificationsRepository = require('../repositories/verifications.repository');

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

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  submitVerification,
  reviewVerification,
  activateUser,
  deactivateUser,
};
