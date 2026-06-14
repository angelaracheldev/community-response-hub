const { validationResult } = require('express-validator');
const complaintsService = require('../services/complaints.service');

async function createComplaint(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const result = await complaintsService.createComplaint(req.user, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Failed to create complaint:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to create complaint', error: error.message });
  }
}

async function listComplaints(req, res) {
  try {
    const result = await complaintsService.listComplaints(req.user, req.query);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to list complaints:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve complaints', error: error.message });
  }
}

async function listMyComplaints(req, res) {
  try {
    const result = await complaintsService.listMyComplaints(req.user);
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to list user complaints:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve user complaints', error: error.message });
  }
}

async function getComplaintById(req, res) {
  try {
    const result = await complaintsService.getComplaintById(req.params.id, req.user);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to fetch complaint:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve complaint', error: error.message });
  }
}

async function updateComplaintStatus(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const result = await complaintsService.updateComplaintStatus(req.params.id, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to update complaint status:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to update status', error: error.message });
  }
}

async function assignComplaint(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const { assignedToUserId } = req.body;
    const result = await complaintsService.assignComplaint(req.params.id, {
      assignedToUserId,
      assignedByUserId: req.user.user_id,
    
    });
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to assign complaint:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to assign complaint', error: error.message });
  }
}

async function cancelComplaint(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  try {
    const result = await complaintsService.cancelComplaint(req.params.id, req.user, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to cancel complaint:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to cancel complaint', error: error.message });
  }
}

async function deleteFailedComplaint(req, res) {
  try {
    const result = await complaintsService.deleteFailedComplaint(req.params.id, req.user);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }
    return res.json(result.body);
  } catch (error) {
    console.error('Failed to delete complaint:', error.message);
    return res.status(500).json({ status: 'error', message: 'Unable to delete complaint', error: error.message });
  }
}

async function updateComplaintPriority(req, res) {
  try {
    const result = await complaintsService.updateComplaintPriority(
      req.params.id,
      req.body,
      req.user
    );

    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    return res.json(result.body);
  } catch (err) {
    console.error('Failed to update priority:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to update priority',
    });
  }
}

async function rejectComplaint(req, res) {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Reason must be at least 10 characters'
      });
    }

    const result = await complaintsService.rejectComplaint(
      req.params.id,
      req.user,
      reason
    );

    if (result.error) {
      return res
        .status(result.error.status)
        .json(result.error.body);
    }

    return res.json(result.body);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: 'error',
      message: 'Unable to reject complaint'
    });
  }
}

module.exports = {
  createComplaint,
  listComplaints,
  listMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  cancelComplaint,
  deleteFailedComplaint,
  updateComplaintPriority,
  rejectComplaint
};

