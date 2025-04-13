// Wait until the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    const addbutton = document.querySelector('.submitAttandance');
    addbutton.hidden = true;
    fetch('http://localhost:3000/classes')
    .then(response => response.json())
    .then(data => {
        const optionForClass = document.querySelector('#class');
        const optionForSection = document.querySelector('#section');
        
        data.forEach(classes => {
            optionForClass.innerHTML += `<option value="${classes.class}">${classes.class}</option>`;
            optionForSection.innerHTML += `<option value="${classes.sec}">${classes.sec}</option>`;
        });
    })

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        // Enable keyboard focus on checkboxes (already works by default)
        checkbox.tabIndex = 0;

        // Add event listener for "keydown"
        checkbox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submit or other default actions
                checkbox.checked = !checkbox.checked;
            }
        });
    });
});


document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();

    const tableBox = document.querySelector('.StudentList');
    tableBox.innerHTML = '';

    const submitButton = document.querySelector('.submitAttandance');
    submitButton.hidden = false;

    const selectedClass = document.querySelector('#class').value;
    const selectedSection = document.querySelector('#section').value;

    fetch(`http://localhost:3000/students?class=${selectedClass}&section=${selectedSection}`)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                const message = document.createElement('h2');
                message.textContent = 'Student List Is Empty';
                tableBox.appendChild(message);
                return;
            }

            const table = document.createElement('table');
            const head = document.createElement('tr');
            head.innerHTML = `
                <th>Roll Number</th>
                <th>Name</th>
                <th>Present</th>
            `;
            table.appendChild(head);

            data.forEach(student => {
                const row = document.createElement('tr');
                console.log(student);
                row.innerHTML = `
                    <td>${student.roll_no}</td>
                    <td>${student.name}</td>
                    <td><input type="checkbox"></td>
                `;
                table.appendChild(row);
            });

            tableBox.appendChild(table);
        })
        .catch(err => {
            console.error('Failed to fetch student data:', err);
        });
});


document.querySelector('.submitAttandance').addEventListener('click', () => {
    const rows = document.querySelectorAll('table tr');
    const attendanceData = [];

    rows.forEach((row, index) => {
        if (index === 0) return; // skip header

        const rollNo = row.children[0].innerText;
        const isPresent = row.querySelector('input[type="checkbox"]').checked;

        attendanceData.push({ rollNo, isPresent });
    });

    fetch('http://localhost:3000/attendance/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendance: attendanceData })
    })
    .then(async response => {
        const result = await response.json();
        if (!response.ok) {
            alert(`Error: ${result.error}`);
            return;
        }
        alert(result.message);
    })
    .catch(err => {
        console.error('Error submitting attendance:', err);
        alert('Error submitting attendance. See console for details.');
    });
});
