document.querySelector('form').addEventListener('submit', e => {
    const tableBox = document.querySelector('.StudentList');
    tableBox.innerHTML = '';

    const messageBox = document.querySelector('.message');
    messageBox.innerHTML = '';

    const addbutton = document.querySelector('.add');
    addbutton.hidden = false;
    e.preventDefault();
    const selectedClass = document.querySelector('#class').value;
    const selectedSection = document.querySelector('#section').value;
    fetch(`http://localhost:3000/students?class=${selectedClass}&section=${selectedSection}`)
        .then(res => res.json())
        .then(data => {
            const addbutton = document.querySelector('.add');
            addbutton.hidden = false;
            let number = data.length;
            const tableBox = document.querySelector('.StudentList');
            const tableStr = document.createElement('table');
            const head = document.createElement('tr');
            head.innerHTML = `
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Father Name</th>
                        <th>Delete</th>
                    `;
            tableStr.appendChild(head);
            tableBox.append(tableStr);
            if(number === 0){
                const message = document.querySelector('.message');
                const row = document.createElement('h2');
                row.innerHTML = `
                    Student List Is Empty 
                `;
                message.appendChild(row);
            }
                const table = document.querySelector('table');
                data.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.roll_no}</td>
                        <td>${student.name}</td>
                        <td>${student.gender}</td>
                        <td>${student.father_name}</td>
                        <td><button class="deleteBtn" data-roll="${student.roll_no}">Delete</button></td>
                    `;
                    table.appendChild(row);
                });
                const addButton = document.querySelector('.add');
                addButton.addEventListener('click', () => {
                    const table = document.querySelector('table');
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><input type="text" value="${number+1}" placeholder="Roll No"></td>
                        <td><input type="text" placeholder="Name"></td>
                        <td>
                            <select>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </td>
                        <td><input type="text" placeholder="Father's Name"></td>
                        <td><button class="submitBtn">Add</button></td>
                    `;
                    table.appendChild(row);
                
                    row.querySelector('.submitBtn').addEventListener('click', () => {
                        const inputs = row.querySelectorAll('input');
                        const select = row.querySelector('select');
                        const studentData = {
                            roll_no: inputs[0].value,
                            name: inputs[1].value,
                            gender: select.value,
                            father_name: inputs[2].value,
                            class: selectedClass,
                            sec: selectedSection
                        };
                        if (!studentData.roll_no || !studentData.name || !studentData.gender || !studentData.father_name) {
                            alert('Please fill in all the fields.');
                            return;
                        }
                        fetch('http://localhost:3000/students/add', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(studentData)
                        })
                        .then(async response => {
                            const result = await response.json();
                            if (!response.ok) {
                                alert(`Error: ${result.error}`);
                                return;
                            }
                            alert(result.message);
                            location.reload();
                        })
                        .catch(err => {
                            console.error('Failed to add student:', err);
                            alert('Network or server error. See console for details.');
                        });                        
                    });                    
                });
                document.querySelectorAll('.deleteBtn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const rollNo = btn.getAttribute('data-roll');
                
                        if (!confirm(`Are you sure you want to delete student with Roll No: ${rollNo}?`)) return;
                
                        fetch(`http://localhost:3000/students/delete/${rollNo}`, {
                            method: 'DELETE'
                        })
                        .then(async response => {
                            const result = await response.json();
                            if (!response.ok) {
                                alert(`Error: ${result.error}`);
                                return;
                            }
                            alert(result.message);
                            location.reload();
                        })
                        .catch(err => {
                            console.error('Failed to delete student:', err);
                            alert('Failed to delete student. See console for details.');
                        });
                    });
                });
                
        })
        .catch(err => {
            console.error('Failed to fetch student data:', err);
        });
});


document.addEventListener('DOMContentLoaded', () => {
    const addbutton = document.querySelector('.add');
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
});