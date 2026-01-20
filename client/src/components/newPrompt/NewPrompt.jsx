import { useEffect, useRef, useState } from "react";
import "./newPrompt.css"
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model, { askGemini } from "../../lib/gemini";

const NewPrompt = () => {  
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [img, setImg] = useState({
         isLoading: false,
         error:"",
         dbData:{}
    })
    const endRef = useRef(null);

    useEffect(() => {                                                       
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

   const add = async (text) => {
    setQuestion(text);

   const response = await askGemini(text);
    setAnswer(response);
   };

   const handleSubmit = async (e) => {
    e.preventDefault();
 
    const text = e.target.text.value;
    if (!text) return;

    await add(text);
    e.target.text.value = "";
   };
   

    return (
        <> 
        {img.isLoading && <div className="">Loading...</div>}
           {img.dbData?.filePath && (
            <IKImage
                urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                path={img.dbData.filePath}
                width="380"
                transformation={[{width: 380 }]}
                />
           )}
           {question && <div className="message user">{question}</div>}
           {answer && <div className="message">{answer}</div>}
           <div className="endChat" ref={endRef}></div>
            <form className="newForm" onSubmit= {handleSubmit}>
                <Upload setImg={setImg}/>
                    <input id="file" type="file" multiple={false} hidden/>
                    <input type="text" name="text" placeholder="Ask anything... "/>
                    <button>
                        <img src="/arrow.png" alt="" />
                    </button>
            </form>
        </>
    )
}

export default NewPrompt;