/**
 * JSX is the combination of HTML, CSS and JavaScript code
 * Its an extension created by React.
 * 
 * Every component must return single parent node which
 * will be rendered on the screen. 
 */

function Student({name, rollNumber}){
    
    return(
        <>
            <p>
                Student Name: {name}
                <br/>
                Roll Number: {rollNumber}
            </p>
        </>
    );
}
export default Student;