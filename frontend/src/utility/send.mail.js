import emailjs from 'emailjs-com';

const sendEmail = (to, subject, message) => {
  return emailjs.send(
    process.env.SERVICE_ID,
    process.env.TEMPLATE_ID,
    {
      to: to,
      subject: subject,
      message: message,
    },
    process.env.PUBLIC_KEY
  );
};

export { sendEmail };