require('dotenv').config({path:'../../.env'});
const { sendApprovalEmail } = require('../utils/email')

async function testEmail() {
  try {
    await sendApprovalEmail('uwasterie07@gmail.com', 'A3', { plate_number: 'RAH412U' });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
  }
}

testEmail();