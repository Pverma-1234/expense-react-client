function student4() {





    const handleClick = () => {
        setVisible(false);
    };
    return (
        <div>
        <button onClick={handleClick}>Hide Student</button>
        {visible && (
            <>
                {StudentList.map((s) => (
                    <p>
                        Roll Number: {s.rollNumber}
                        <br/>
                        Name: {s.name}
                    </p>
                ))}
            
            </>
        )}
        </div>
    );
}