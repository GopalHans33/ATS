document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/classes')
        .then(response => response.json())
        .then(data => {
            const optionForClass = document.querySelector('#class');
            const optionForSection = document.querySelector('#section');
            
            data.forEach(classes => {
                optionForClass.innerHTML += `<option value="${classes.class}">${classes.class}</option>`;
                optionForSection.innerHTML += `<option value="${classes.sec}">${classes.sec}</option>`;
            });
        });

    document.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        const selectedClass = document.querySelector('#class').value;
        const selectedSection = document.querySelector('#section').value;

        fetch(`http://localhost:3000/students?class=${selectedClass}&section=${selectedSection}`)
            .then(res => res.json())
            .then(data => {
                const studentBox = document.querySelector('.StudentList');
                studentBox.innerHTML = '';
                const table = document.createElement('table');
                const head = document.createElement('tr');
                head.innerHTML = `
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Action</th>
                `;
                table.appendChild(head);

                data.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.roll_no}</td>
                        <td>${student.name}</td>
                        <td><button class="viewReport" data-roll="${student.roll_no}" data-name="${student.name}">View Report</button></td>
                    `;
                    table.appendChild(row);
                });

                studentBox.appendChild(table);

                // Add click event to each "View Report" button
                document.querySelectorAll('.viewReport').forEach(button => {
                    button.addEventListener('click', (e) => {
                        console.log(e.target);
                        const rollNo = e.target.getAttribute('data-roll');
                        const name = e.target.getAttribute('data-name');
                        console.log(rollNo);
                        // Hide student list
                        document.querySelector('.StudentList').style.display = 'none';

                        // Fetch attendance history
                        fetch(`http://localhost:3000/attendance/history/${rollNo}`)
                            .then(res => res.json())
                            .then(dates => {
                                const card = document.querySelector('.card');
                                card.innerHTML = `
                                    <h2>${name} -- Roll No: ${rollNo}</h2>
                                    <ol>
                                        ${dates.map(d => {
                                            const dateObj = new Date(d.date);
                                            const day = String(dateObj.getDate()).padStart(2, '0');
                                            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                                            const year = dateObj.getFullYear();
                                            return `<li>${day}/${month}/${year}</li>`;
                                        }).join('')}                                                                      
                                    </ol>
                                    <button id="backBtn">Back</button>
                                `;

                                // Add back button to return to list
                                document.getElementById('backBtn').addEventListener('click', () => {
                                    document.querySelector('.card').innerHTML = '';
                                    document.querySelector('.StudentList').style.display = 'block';
                                });
                            });
                    });
                });
            });
    });
});