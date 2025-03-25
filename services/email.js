const nodemailer = require('nodemailer');
const SibApiV3Sdk = require("sib-api-v3-sdk");
const ejs = require('ejs');
const path = require('path'); // Import path module
const dotenv = require('dotenv');
dotenv.config({ path: ".env" });

// Define __basedir as the project's root directory
global.__basedir = path.resolve(__dirname, "..");

// SendInBlue Setup to send email
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendMail = async (obj) => {
  try {
    let htmlText = '';
    if (obj.template) {
      const templatePath = path.join(__basedir, obj.template, 'html.ejs');
      htmlText = await ejs.renderFile(templatePath, { data: obj.data || {} });
    }

    const sender = {
      email: process.env.COMPANY_EMAIL,
      name: process.env.COMPANY_NAME
    };

    const receivers = [{ email: obj.to }];

    console.log(sender, 'sender');
    console.log(receivers, 'receiver');

    return tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Welcome To Nsfashion",
      htmlContent: htmlText
    }).then(console.log).catch(console.log);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendMail };
