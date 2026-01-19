import { Link } from "react-router-dom";
import "./chatList.css";

const ChatList = () => {
    return (
        <div className="chatList">  
        <span className="title">DASHBOARD</span>
        <Link to="/dashboard">Create a New Chat</Link>
        <Link to="/">Explore Promptiqo</Link> 
        <Link to="/">Contact</Link>
        <hr/>
        <span className="title">RECENT CHATS</span>
        <div className="list">
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
           <Link to="/">My chat title</Link>
        </div>
        <hr/>
        <div className="upgrade">
            <img src="/Promptiqo.png" alt="" />
            <div className="texts">
                <span>Upgrade to Promptiqo Pro</span>
                <span>Get access to advanced features and priority support.</span>
        </div>
        </div>
        </div>
    )
}       

export default ChatList;
