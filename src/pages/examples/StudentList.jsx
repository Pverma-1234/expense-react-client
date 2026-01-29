import Student3 from "./Student3";

function StudentList({student}) {
    const filterStudent = student.filter(student => {
        const
    });

    return (
        <>
            <h2>Student List</h2>
            {
                student.map((student, index) => (
                    <Student3
                        key={index} 
                        name={student.name} 
                        rollNumber={student.rollNumber} 
                        percentage={student.percentage} 
                    />
                ))
            }
            
        </>
    );
}

export default StudentList;