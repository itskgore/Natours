const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// new Email(user,url).sendWelcome();
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Karan Gore <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass:
            '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'
        }
      });
    }
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '2b2da6cf8800aa',
        pass: 'd84d44d7ac4157'
      }
    });
  }

  // Send the actual email
  async sendEmail(template, subject) {
    //1) Render HTML from email based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject: this.subject
    });

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: htmlToText.fromString(html),
      html: html
    };

    //3) Create a transport and send email
    // this.newTransport();
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.sendEmail('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.sendEmail(
      'passwordReset', // template name
      'Your Password Token (valid for only 10 mins'
    );
  }
};

// const sendEmail = async options => {
// const transporter = nodemailer.createTransport({
//     service:'Gmail',
//     auth: {
//         user:process.env.EMAIL_USERNAME,
//         pass:process.env.EMAIL_PASSWORD,
//     }
//     // to work with gmail service we have to activate the "Less Secure app" option
// })

// 1) Create a transporter [a service which will send the email like gmail]
// var transport = nodemailer.createTransport({
//   host: 'smtp.mailtrap.io',
//   port: 2525,
//   auth: {
//     user: '2b2da6cf8800aa',
//     pass: 'd84d44d7ac4157'
//   }
// });

// 2) Define email options
// const mailOptions = {
//   from: 'Karan Gore <karangore518@gmail.com>',
//   to: options.email,
//   subject: options.subject,
//   text: options.message
// };

// 3) Sent the email with nodemailer
// await transport.sendMail(mailOptions);
// };

// module.exports = sendEmail;
