import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagerlink.com",
    },
  });
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,  
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@exmple.com",
    to: options.email,
    text: emailTextual,
    html: emailHtml,
  };
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Email services could not be reached");
    console.error(error);
  }
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We are excited to have you on board.",
      action: {
        instructions: "To verify your email, please click on the button",
        button: {
          color: "#22BC66",
          text: "Verify BaseCamp",
          link: verificationUrl,
        },
      },
      outro:
        "Have Questions? Reply to this mail in order to get your queries solved, our team will reach out ASAP",
    },
  };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset your password of your account.",
      action: {
        instructions: "To reset your password, please click on the button",
        button: {
          color: "#22BC66",
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Have Questions? Reply to this mail in order to get your queries solved, our team will reach out ASAP",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
