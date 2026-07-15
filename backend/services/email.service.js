const transporter = require("../utils/mail");

const sendOTPEmail = async (collegeEmail, otp) => {
  await transporter.sendMail({
    from: `"Training & Placement Office" <${process.env.EMAIL_USER}>`,
    to: collegeEmail,
    subject: "Verify Your College Email - TPO Portal",
   html: `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px;">

  <h2 style="color:#0f4c81; margin-bottom:5px;">
    Training & Placement Office
  </h2>

  <p style="margin-top:0; color:#555;">
    Government Women Engineering College, Ajmer
  </p>

  <hr>

  <p>Dear Student,</p>

  <p>
    Thank you for registering on the <strong>TPO Portal</strong>.
    Please use the following One-Time Password (OTP) to verify your college email address.
  </p>

  <div style="text-align:center; margin:30px 0;">
    <span style="font-size:32px; font-weight:bold; letter-spacing:6px; color:#0f4c81;">
      ${otp}
    </span>
  </div>

  <p>
    This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.
  </p>

  <p>
    If you did not request this verification, you may safely ignore this email.
  </p>

  <br>

  <p>
    Regards,<br>
    <strong>Training & Placement Office</strong><br>
    Government Women Engineering College, Ajmer
  </p>

  <hr>

  <p style="font-size:12px; color:#777;">
    This is an automated email from the TPO Portal. Please do not reply to this email.
  </p>

</div>
`
  });
};

module.exports = {
  sendOTPEmail,
};