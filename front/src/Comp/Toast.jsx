import toast from 'react-hot-toast';

export const notifySuccess = (msg) =>
  toast.success(msg, {
    style: {
      borderRadius: '10px',
      background: '#0f172a',
      color: '#fff',
    },
  });

export const notifyError = (msg) =>
  toast.error(msg, {
    style: {
      borderRadius: '10px',
      background: '#7f1d1d',
      color: '#fff',
    },
  });

export default { notifySuccess, notifyError };