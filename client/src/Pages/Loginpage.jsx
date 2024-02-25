import { LoginForm } from "../Components/Login/Login"
import LoginImage from '../assets/userimg.png'
export const Login = () => {
    return (
        <div style={{display:"flex"}}>
            <img style={{maxHeight:"100vh", width:"55vw"}}  src={LoginImage}/>
            <LoginForm />
        </div>
    )
};