import { useEffect, useRef, useState } from "react";
import "./newPrompt.css"
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
// ...existing code...
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const NewPrompt = ({data}) => {  
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [img, setImg] = useState({
         isLoading: false,
         error:"",
         dbData:{},
         aiData: {},
    });

    // Gemini chat now handled by backend
    const endRef = useRef(null);



    useEffect(() => {                                                       
        endRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [data?.history, img.dbData]);  // scroll on history change

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // For existing chat (PUT)
    const mutation = useMutation({
        mutationFn: () => {
            return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data?._id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: question.length ? question : undefined,
                        answer,
                        img: img.dbData?.filePath || undefined,
                    })
                }).then((res) => res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat', data._id] });
            setQuestion("");
            setAnswer("");
            setImg({
                isLoading: false,
                error: "",
                dbData: {},
                aiData: {},
            });
        },
        onError: (err) => {
            console.log(err)
        }
    });


        // For new chat (POST)
        const add = async (text) => {
            setQuestion(text);
            setAnswer("");
            if (!data?._id) {
                // New chat: POST, then redirect
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ text })
                    });
                    const chatId = await res.json();
                    if (chatId) {
                        queryClient.invalidateQueries({ queryKey: ['userChats'] });
                        navigate(`/dashboard/chats/${chatId}`);
                    }
                } catch (err) {
                    console.log(err);
                }
            } else {
                mutation.mutate();
            }
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
                        transformation={[{ width: 380 }]}
                    />
                )}
                <div className="endChat" ref={endRef}></div>
                <form className="newForm" onSubmit={handleSubmit}>
                    <Upload setImg={setImg} />
                    <input id="file" type="file" multiple={false} hidden />
                    <input type="text" name="text" placeholder="Ask anything... " />
                    <button>
                        <img src="/arrow.png" alt="" />
                    </button>
                </form>
            </>
        );
}

export default NewPrompt;