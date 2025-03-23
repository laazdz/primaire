document.addEventListener('DOMContentLoaded', () => {
    const excelUpload = document.getElementById('excel-upload');
    const otherSubjectsTableBody = document.getElementById('other-subjects-table-body');
    const arabicTableBody = document.getElementById('arabic-table-body');
    const mathTableBody = document.getElementById('math-table-body');

    // التعامل مع رفع ملف Excel
    excelUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    // التحقق من وجود بيانات
                    if (!jsonData || jsonData.length === 0) {
                        alert('ملف Excel فارغ أو لا يحتوي على بيانات.');
                        return;
                    }

                    // تجاهل السطر الأول (رؤوس الأعمدة) والبدء من السطر الثاني
                    let students = jsonData.slice(1).map((row) => {
                        const firstName = row[0] || 'غير محدد'; // العمود الأول: الاسم
                        const lastName = row[1] || 'غير محدد'; // العمود الثاني: اللقب
                        return {
                            fullName: `${firstName} ${lastName}` // دمج الاسم واللقب
                        };
                    });

                    // التحقق من السطر الثاني في ملف Excel (السطر الأول في students بعد slice)
                    if (students.length > 0 && students[0].fullName.toLowerCase().includes('nom prenom')) {
                        students = students.filter((_, index) => index !== 0);
                    }

                    // تجاهل أي سطر يحتوي على "غير محدد غير محدد"
                    students = students.filter(student => student.fullName !== 'غير محدد غير محدد');

                    // التحقق من أن هناك أسماء تم استخراجها
                    if (students.length === 0) {
                        alert('لم يتم العثور على بيانات صالحة لأسماء التلاميذ في ملف Excel. يرجى التأكد من أن الملف يحتوي على أسماء وألقاب صالحة.');
                        return;
                    }

                    // ملء جميع الجداول بنفس قائمة التلاميذ
                    populateTable(students, 'other-subjects');
                    populateTable(students, 'arabic');
                    populateTable(students, 'math');
                } catch (error) {
                    alert('حدث خطأ أثناء قراءة ملف Excel. يرجى التأكد من أن الملف صالح وغير تالف.\nالخطأ: ' + error.message);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('يرجى اختيار ملف Excel للاستيراد.');
        }
    });

    // ملء الجدول بأسماء التلاميذ
    function populateTable(students, tableType) {
        const tableBody = document.getElementById(`${tableType}-table-body`);
        tableBody.innerHTML = ''; // مسح الجدول الحالي

        students.forEach((student, index) => {
            const row = document.createElement('tr');

            if (tableType === 'other-subjects') {
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullName}</td>
                    <td class="total">0.00</td>
                    <td class="average">0.00</td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                `;
            } else if (tableType === 'arabic') {
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullName}</td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                `;
            } else if (tableType === 'math') {
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullName}</td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                    <td><input type="number" step="0.01" min="0" max="10" value=""></td>
                    <td><input type="text" class="remarks" readonly></td>
                `;
            }

            tableBody.appendChild(row);

            // إضافة مستمع لتحديث الملاحظات
            const inputs = row.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.addEventListener('input', () => calculateRow(row, tableType));
            });
        });
    }

    // حساب المجموع والمتوسط وتحديد الملاحظات
    function calculateRow(row, tableType) {
        const inputs = row.querySelectorAll('input[type="number"]');
        const remarksFields = row.querySelectorAll('.remarks');
        let total = 0;
        let count = 0;

        inputs.forEach((input, index) => {
            const value = parseFloat(input.value) || 0;
            total += value;
            if (input.value !== '') {
                count++;
            }

            // تطبيق المعادلة لتحديد الملاحظات بناءً على الدرجة
            const remark = getRemark(value);
            remarksFields[index].value = remark;
        });

        // تحديث المجموع والمتوسط فقط في جدول "باقي المواد"
        if (tableType === 'other-subjects') {
            const average = count > 0 ? (total / count).toFixed(2) : 0;
            row.querySelector('.total').textContent = total.toFixed(2);
            row.querySelector('.average').textContent = average;
        }
    }

    // دالة لتحديد الملاحظات بناءً على الدرجة
    function getRemark(score) {
        if (score === 10) return "ممتاز";
        if (score >= 9.5) return "ممتاز";
        if (score >= 9.0) return "جيد جدًا";
        if (score >= 8.5) return "جيد";
        if (score >= 8.0) return "مقبول";
        if (score >= 7.5) return "متوسط";
        if (score >= 7.0) return "ضعيف";
        if (score >= 6.5) return "ضعيف جدًا";
        if (score >= 6.0) return "غير كافٍ";
        if (score >= 5.0) return "غير كافٍ جدًا";
        if (score > 0) return "ضعيف جدًا";
        return "غائب";
    }
});

// دالة للتحكم في التبويبات
function showTab(tabId) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // إزالة الـ active من جميع الأزرار
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // إظهار التبويب المختار
    document.getElementById(tabId).classList.add('active');

    // إضافة الـ active للزر المختار
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// دالة لتصدير جميع الجداول إلى Excel في ملف واحد
function exportToExcel() {
    // إنشاء كائن Workbook جديد
    const workbook = XLSX.utils.book_new();

    // الجداول الثلاثة
    const tables = [
        { id: 'other-subjects-table', sheetName: 'باقي المواد' },
        { id: 'arabic-table', sheetName: 'اللغة العربية' },
        { id: 'math-table', sheetName: 'الرياضيات' }
    ];

    // تحويل كل جدول إلى ورقة (sheet) في الملف
    tables.forEach(tableInfo => {
        const table = document.getElementById(tableInfo.id);
        const worksheet = XLSX.utils.table_to_sheet(table);
        XLSX.utils.book_append_sheet(workbook, worksheet, tableInfo.sheetName);
    });

    // تحديد اسم الملف
    const fileName = 'نقاط_التلاميذ.xlsx';

    // حفظ الملف
    XLSX.writeFile(workbook, fileName);
    alert(`تم تصدير جميع الجداول إلى Excel بنجاح باسم: ${fileName}`);
}