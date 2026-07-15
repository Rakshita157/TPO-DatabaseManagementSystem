const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const FIRST_NAMES_F = ['Ananya', 'Diya', 'Ira', 'Navya', 'Saanvi', 'Myra', 'Aanya', 'Pari', 'Riya', 'Sara', 'Aisha', 'Kavya', 'Tara', 'Nisha', 'Priya', 'Simran', 'Neha', 'Megha', 'Pooja', 'Deepika'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Mishra', 'Joshi', 'Rao', 'Choudhary', 'Meena', 'Yadav', 'Chauhan', 'Tiwari', 'Pandey', 'Saxena', 'Malhotra', 'Chhabra'];

const DEPARTMENTS = {
  BTECH: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'],
  MTECH: ['Computer Science and Engineering', 'VLSI Design', 'Power Systems', 'Structural Engineering'],
  MBA: ['Finance', 'Marketing', 'Human Resource Management', 'Operations Management'],
  MCA: ['Computer Applications'],
};

const COURSES = ['BTECH', 'MTECH', 'MBA', 'MCA'];
const COURSE_WEIGHTS = [30, 10, 5, 5];
const BOARDS = ['CBSE', 'RBSE', 'ICSE', 'ISC'];
const CITIES = ['Ajmer', 'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Alwar', 'Bikaner', 'Pushkar', 'Nagpur', 'Delhi'];
const STATES = ['Rajasthan', 'Maharashtra', 'Delhi', 'Madhya Pradesh', 'Gujarat'];
const GENDERS = ['Female'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function generateNames(count) {
  const names = [];
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES_F);
    names.push(`${first} ${pick(LAST_NAMES)}`);
  }
  return names;
}

function generateEmail(fullName) {
  const parts = fullName.toLowerCase().split(' ');
  return `${parts[0]}.${parts[1]}${randInt(1, 99)}@gweca.ac.in`;
}

async function seedStudents() {
  const existing = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  if (existing) {
    console.log('Students already seeded, skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash('Student@123', 10);
  const names = generateNames(50);
  const usedEmails = new Set();
  const usedPhone = new Set();
  const usedCollegeId = new Set();
  const usedBtuRoll = new Set();
  const usedEnrollment = new Set();
  const usedAadhar = new Set();
  const usedPan = new Set();

  function uniqueEmail(name) {
    let email = generateEmail(name);
    while (usedEmails.has(email)) {
      const parts = name.toLowerCase().split(' ');
      email = `${parts[0]}.${parts[1]}${randInt(100, 999)}@gweca.ac.in`;
    }
    usedEmails.add(email);
    return email;
  }

  function uniquePhone() {
    let p;
    do { p = String(randInt(6000000000, 9999999999)); } while (usedPhone.has(p));
    usedPhone.add(p);
    return p;
  }

  function uniqueCollegeId(course) {
    const prefix = { BTECH: 'GW', MTECH: 'GM', MBA: 'GB', MCA: 'GC' }[course];
    let id;
    do { id = `${prefix}${randInt(1000, 9999)}`; } while (usedCollegeId.has(id));
    usedCollegeId.add(id);
    return id;
  }

  function uniqueBtuRoll(year) {
    let r;
    do { r = `${year}${String(randInt(10000, 99999))}`; } while (usedBtuRoll.has(r));
    usedBtuRoll.add(r);
    return r;
  }

  function uniqueEnrollment() {
    let e;
    do { e = `E${randInt(100000, 999999)}`; } while (usedEnrollment.has(e));
    usedEnrollment.add(e);
    return e;
  }

  function uniqueAadhar() {
    let a;
    do { a = String(randInt(100000000000, 999999999999)); } while (usedAadhar.has(a));
    usedAadhar.add(a);
    return a;
  }

  function uniquePan() {
    let p;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    do {
      p = `${pick(letters)}${pick(letters)}${pick(letters)}${randInt(1000, 9999)}${pick(letters)}`;
    } while (usedPan.has(p));
    usedPan.add(p);
    return p;
  }

  console.log('Seeding 50 students...');

  for (let i = 0; i < 50; i++) {
    const fullName = names[i];
    const email = uniqueEmail(fullName);
    const gender = "Female";
    const course = weightedPick(COURSES, COURSE_WEIGHTS);
    const department = pick(DEPARTMENTS[course]);

    const currentYear = course === 'MCA' ? randInt(1, 2) : randInt(2, 4);
    const currentSemester = currentYear === 4 ? randInt(7, 8) : randInt((currentYear - 1) * 2 + 1, currentYear * 2);
    const actualAdmissionYear = course === 'BTECH' || course === 'MCA' ? 2022 : 2023;
    const actualGraduationYear = actualAdmissionYear + (course === 'BTECH' ? 4 : course === 'MCA' ? 2 : 2);

    const user = await prisma.user.create({
      data: {
        fullName,
        collegeEmail: email,
        password: passwordHash,
        role: 'STUDENT',
      },
    });

    const cgpa = (Math.random() * 3.5 + 5.5).toFixed(2);
    const activeBacklogs = Math.random() < 0.8 ? 0 : randInt(1, 3);
    const passiveBacklogs = activeBacklogs === 0 ? randInt(0, 2) : activeBacklogs + randInt(0, 2);

    const dobYear = randInt(2002, 2004);
    const dob = new Date(dobYear, randInt(0, 11), randInt(1, 28));

    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        course,
        department,
        admissionYear: actualAdmissionYear,
        graduationYear: actualGraduationYear,
        currentYear,
        currentSemester,
        collegeId: uniqueCollegeId(course),
        btuRollNumber: uniqueBtuRoll(actualAdmissionYear),
        enrollmentNumber: uniqueEnrollment(),
        dob,
        gender,
        phoneNumber: uniquePhone(),
        whatsappNumber: uniquePhone(),
        currentAddress: `${randInt(1, 200)}, Ward ${randInt(1, 30)}, ${pick(CITIES)}`,
        permanentAddress: `${randInt(1, 150)}, Village ${pick(CITIES)}, ${pick(STATES)}`,
        nativeCity: pick(CITIES),
        nativeDistrict: pick(CITIES),
        nativeState: pick(STATES),
        aadharNumber: uniqueAadhar(),
        panNumber: Math.random() < 0.85 ? uniquePan() : null,
        tenthPercentage: (Math.random() * 20 + 70).toFixed(1),
        tenthYear: actualAdmissionYear - 4,
        tenthBoard: pick(BOARDS),
        twelfthPercentage: (Math.random() * 20 + 65).toFixed(1),
        twelfthYear: actualAdmissionYear - 2,
        twelfthBoard: pick(BOARDS),
        cgpa,
        activeBacklogs,
        passiveBacklogs,
        linkedinUrl: Math.random() < 0.75 ? `https://linkedin.com/in/${fullName.toLowerCase().replace(' ', '-')}-${randInt(100, 999)}` : null,
        placementStatus: Math.random() < 0.3 ? 'PLACED' : 'NOT_PLACED',
        profileStatus: Math.random() < 0.8 ? 'COMPLETE' : 'INCOMPLETE',
        isVerified: Math.random() < 0.9,
      },
    });

    const semestersToShow = course === 'BTECH' ? 8 : course === 'MCA' ? 4 : 4;
    for (let sem = 1; sem <= Math.min(currentSemester, semestersToShow); sem++) {
      const sgpa = (Math.random() * 3 + 6).toFixed(2);
      await prisma.semesterResult.create({
        data: {
          userId: user.id,
          semester: sem,
          sgpa,
        },
      });
    }

    if (Math.random() < 0.7) {
      await prisma.document.create({
        data: {
          userId: user.id,
          resumeUrl: `uploads/resumes/${fullName.toLowerCase().replace(' ', '_')}_resume.pdf`,
        },
      });
    }
  }

  console.log('50 students seeded successfully.');
}

async function main() {
  const existing = await prisma.collegeSettings.findFirst();
  if (!existing) {
    await prisma.collegeSettings.create({
      data: {
        id: 1,
        tpoHeadName: 'Mr. Yashvin Gupta',
        tpoHeadPhoto: 'uploads/tpo/tpo-head.jpg',
        tpoHeadEmail: 'Tpo@gweca.ac.in',
        tpoHeadPhone: '7737394938',
        officeAddress: 'Govt. Women Engineering College Nasirabad Road, Makhupura Ajmer - 305002, Rajasthan, India',
        officeHours: '10am-5pm',
      },
    });
  }

  await seedStudents();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
