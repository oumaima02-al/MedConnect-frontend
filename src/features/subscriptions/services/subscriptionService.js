import api from '../../../services/api';

export const subscriptionService = {
  updateSubscription: (userId, { planType, paymentReference }) =>
    api.put(`/users/${userId}/subscription`, { planType, paymentReference }),
  cancelSubscription: (userId) =>
    api.delete(`/users/${userId}/subscription`),
};
