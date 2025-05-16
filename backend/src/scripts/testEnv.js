require('dotenv').config({path:'../../.env'});
console.log('DATABASE_URL:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('NODEMAILER_EMAIL:', process.env.EMAIL_USER);
console.log('NODEMAILER_PASS:', process.env.EMAIIL_PASS);