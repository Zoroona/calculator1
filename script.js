document.getElementById('programForm').addEventListener('input', function(event) {
    calculateProgramCosts();
});

document.getElementById('salaryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    calculateSalary(true);
});

document.getElementById('printButton').addEventListener('click', function() {
    window.print();
});

document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('salaryForm').reset();
    document.getElementById('programForm').reset();
    document.getElementById('result').innerHTML = '';
    memberCount = 0;
    results = [];
    calculateProgramCosts();
});

document.getElementById('saveButton').addEventListener('click', function() {
    saveToExcel();
});

document.getElementById('loadButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    loadFromExcel(event.target.files[0]);
});

document.getElementById('backButton').addEventListener('click', function() {
    if (results.length > 0) {
        results.pop();
        memberCount--;
        displayResults();
        calculateProgramCosts();
    }
});

let memberCount = 0;
let results = [];

document.getElementById('bs_hours').addEventListener('input', updateTotalHours);
document.getElementById('ms_hours').addEventListener('input', updateTotalHours);
document.getElementById('other_hours').addEventListener('input', updateTotalHours);

function updateTotalHours() {
    const bsHours = parseInt(document.getElementById('bs_hours').value) || 0;
    const msHours = parseInt(document.getElementById('ms_hours').value) || 0;
    const otherHours = parseInt(document.getElementById('other_hours').value) || 0;
    const totalHours = bsHours + msHours + otherHours;
    document.getElementById('total_hours').value = totalHours;
}

function calculateProgramCosts() {
    const totalStudents = parseInt(document.getElementById('total_students').value) || 0;
    const termHours = parseInt(document.getElementById('term_hours').value) || 0;
    const programPrice = parseFloat(document.getElementById('program_price').value) || 0;
    const universityPercentage = parseFloat(document.getElementById('university_percentage').value) || 0;

    const totalPrice = totalStudents * termHours * programPrice;
    const universityShare = totalPrice * (universityPercentage / 100);
    const remainingPrice = totalPrice - universityShare;
    const totalMemberSalary = results.reduce((acc, member) => acc + member.totalSalary, 0);
    const finalRemainingPrice = remainingPrice - totalMemberSalary;

    document.getElementById('total_price').value = totalPrice.toFixed(2);
    document.getElementById('remaining_price').value = remainingPrice.toFixed(2);
    document.getElementById('total_member_salary').value = totalMemberSalary.toFixed(2);
    document.getElementById('final_remaining_price').value = finalRemainingPrice.toFixed(2);
}

function calculateSalary(addNew = false) {
    const name = document.getElementById('name').value;
    const position = document.getElementById('position').value;
    const bsHours = parseInt(document.getElementById('bs_hours').value) || 0;
    const msHours = parseInt(document.getElementById('ms_hours').value) || 0;
    const otherHours = parseInt(document.getElementById('other_hours').value) || 0;
    const totalHours = bsHours + msHours + otherHours;
    const weeks = parseInt(document.getElementById('weeks').value) || 1;
    const courseCode = document.getElementById('course_code').value;
    const sectionNumber = parseInt(document.getElementById('section_number').value) || 0;
    const studentsNumber = parseInt(document.getElementById('students_number').value) || 0;
    const studentsType = document.getElementById('students_type').value;
    const studentsLevel = document.getElementById('students_level').value;
    const notes = document.getElementById('notes').value;
    const adminTask = document.getElementById('admin_task').value;

    let salary, threshold;
    switch(position) {
        case 'professor':
            salary = 400;
            threshold = 10;
            break;
        case 'associate_professor':
            salary = 350;
            threshold = 12;
            break;
        case 'assistant_professor':
            salary = 300;
            threshold = 14;
            break;
        case 'lecturer':
            salary = 250;
            threshold = 16;
            break;
        case 'teaching_assistant':
            salary = 200;
            threshold = 18;
            break;
        default:
            salary = 0;
            threshold = 0;
    }

    let eligibilityStatus;
    if (adminTask === 'yes' && totalHours > 3) {
        eligibilityStatus = 'يستحق';
    } else if (adminTask === 'no' && totalHours <= threshold) {
        eligibilityStatus = 'لا يستحق';
    } else {
        eligibilityStatus = 'لا يستحق';
    }

    const totalSalary = msHours * weeks * salary;

    const result = document.getElementById('result');

    const memberResult = `
        <tr>
            <td>${memberCount + 1}</td>
            <td>${name}</td>
            <td>${position}</td>
            <td>${salary} ريال</td>
            <td>${threshold} ساعات</td>
            <td>${totalHours} ساعة</td>
            <td>${eligibilityStatus}</td>
            <td>${totalSalary} ريال</td>
            <td>${courseCode}</td>
            <td>${sectionNumber}</td>
            <td>${studentsNumber}</td>
            <td>${studentsType}</td>
            <td>${studentsLevel}</td>
            <td>${notes}</td>
        </tr>
    `;

    results.push({
        name,
        position,
        salary,
        threshold,
        totalHours,
        eligibilityStatus,
        totalSalary,
        courseCode,
        sectionNumber,
        studentsNumber,
        studentsType,
        studentsLevel,
        notes
    });

    if (addNew) {
        result.querySelector('tbody').innerHTML += memberResult;
    } else {
        result.querySelector('tbody').innerHTML = memberResult;
    }

    memberCount++;
    document.getElementById('salaryForm').reset();
    calculateProgramCosts();
}

function saveToExcel() {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "results.xlsx");
}

function loadFromExcel(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        results = json;
        displayResults();
        calculateProgramCosts();
    };
    reader.readAsArrayBuffer(file);
}

function displayResults() {
    const result = document.getElementById('result');
    result.querySelector('tbody').innerHTML = '';
    memberCount = 0;
    results.forEach((member, index) => {
        const memberResult = `
            <tr>
                <td>${index + 1}</td>
                <td>${member.name}</td>
                <td>${member.position}</td>
                <td>${member.salary} ريال</td>
                <td>${member.threshold} ساعات</td>
                <td>${member.totalHours} ساعة</td>
                <td>${member.eligibilityStatus}</td>
                <td>${member.totalSalary} ريال</td>
                <td>${member.courseCode}</td>
                <td>${member.sectionNumber}</td>
                <td>${member.studentsNumber}</td>
                <td>${member.studentsType}</td>
                <td>${member.studentsLevel}</td>
                <td>${member.notes}</td>
            </tr>
        `;
        result.querySelector('tbody').innerHTML += memberResult;
        memberCount++;
    });
}

// Create table structure
document.getElementById('result').innerHTML = `
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>اسم العضو</th>
                <th>المرتبة العلمية</th>
                <th>المرتب</th>
                <th>النصابة</th>
                <th>مجموع الساعات التدريسية</th>
                <th>الحق في المرتب</th>
                <th>المرتب الكلي</th>
                <th>رمز المقرر</th>
                <th>رقم الشعبة</th>
                <th>عدد الطلاب في الشعبة</th>
                <th>نوع الطلاب</th>
                <th>مستوى الطلاب</th>
                <th>ملاحظات</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
`;
