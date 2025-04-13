const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

// Setup MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Gopal@1234',
    database: 'attendance'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
    } else {
        console.log('Connected to MySQL database!');
    }
});

app.get('/classes', (req, res) => {
    const sql = 'SELECT DISTINCT class, sec FROM classes';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});


// API endpoint to get student data
app.get('/students', (req, res) => {
    const { class: className, section } = req.query;
    let sql = 'SELECT * FROM students';
    const params = [];

    if (className && section) {
        sql += ' WHERE class = ? AND sec = ?';
        params.push(className, section);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});


app.post('/students/add', (req, res) => {

    const { roll_no, name, gender, father_name, class: className, sec } = req.body;

    // Check if student with the same roll_no exists
    const checkQuery = 'SELECT * FROM students WHERE roll_no = ?';
    db.query(checkQuery, [roll_no], (err, results) => {
        if (err) {
            console.error('Check error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Roll Number already exists!' });
        }

        // Insert new student
        const insertQuery = `
            INSERT INTO students 
            (roll_no, name, gender, father_name, class, sec)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [roll_no, name, gender, father_name, className, sec];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({ error: 'Failed to insert student' });
            }
            res.json({ message: 'Student added successfully!' });
        });
    });
});

app.delete('/students/delete/:rollNo', async (req, res) => {
    const rollNo = req.params.rollNo;
    try {
        await db.query('DELETE FROM attendance WHERE roll_no = ?', [rollNo]);
        await db.query('DELETE FROM students WHERE roll_no = ?', [rollNo]);
        res.json({ message: 'Student and related attendance deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

app.post('/attendance/submit', (req, res) => {
    const attendance = req.body.attendance;
    if (!Array.isArray(attendance)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const insertQueries = attendance.map(({ rollNo, isPresent }) => {
        const status = isPresent ? 'Present' : 'Absent';

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO attendance (date, roll_no, status)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE status = VALUES(status)
            `;
            db.query(query, [today, rollNo, status], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(insertQueries)
        .then(() => {
            res.json({ message: 'Attendance submitted and saved successfully!' });
        })
        .catch(err => {
            console.error('Error inserting attendance:', err);
            res.status(500).json({ error: 'Failed to save attendance' });
        });
});

app.get('/attendance/history/:rollNo', (req, res) => {
    const rollNo = req.params.rollNo;
    const query = `
        SELECT date FROM attendance 
        WHERE roll_no = ? AND status = 'Present'
        ORDER BY date DESC
    `;

    db.query(query, [rollNo], (err, results) => {
        if (err) {
            console.error('Attendance history fetch error:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance history' });
        }
        res.json(results);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
