import { RegisterForm } from '../Components/Signup/Signup'
import LoginImage from '../assets/userimg.png'

export const Register = () => {
    return (
        <div style={{display:"flex"}}>
            <img style={{maxHeight:"100vh", width:"55vw"}}  src={LoginImage}/>
            <RegisterForm />
        </div>
    )
};