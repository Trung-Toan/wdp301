import emailjs from 'emailjs-com';

const sendEmail = (to, subject, message) => {
  return emailjs.send(
    'service_drveurc',
    'template_abotd4t',
    {
      to: to,
      subject: subject,
      message: message,
    },
    'OEj4kkgxdJXtWCV0_'
  );
};

export { sendEmail };