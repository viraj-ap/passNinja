import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';

const Manager = () => {
    const imgRef = useRef();
    const inputRef = useRef();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ site: "", username: "", password: "" });
    const [passwordsArray, setPasswordsArray] = useState([]);
    const [validationMessage, setValidationMessage] = useState("");

    const getPasswords = async () => {
        try {
            let req = await fetch("http://localhost:5173/");
            let passwords = await req.json();
            setPasswordsArray(passwords);
        } catch (error) {
            console.error("Error fetching passwords:", error);
        }
    };

    useEffect(() => {
        getPasswords();
    }, []);

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        toast('Copied to clipboard!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
        if (showPassword) {
            imgRef.current.src = "/show password.svg";
            inputRef.current.type = "password";
        } else {
            imgRef.current.src = "/hide password.svg";
            inputRef.current.type = "text";
        }
    };

    const togglePasswordVisibilityInTable = (id) => {
        const updatedPasswords = passwordsArray.map(item => {
            if (item._id === id) {
                return { ...item, visible: !item.visible };
            }
            return item;
        });
        setPasswordsArray(updatedPasswords);
    };

    const savePassword = async () => {
        if (!form.site || !form.username || !form.password) {
            setValidationMessage("Please fill out all fields.");
            return;
        }

        const newPassword = { ...form, id: uuidv4(), visible: false };
        const updatedPasswords = [...passwordsArray, newPassword];
        setPasswordsArray(updatedPasswords);

        try {
            await fetch("http://localhost:4000/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPassword)
            });
            setForm({ site: "", username: "", password: "" });
            setValidationMessage("");
            toast('Password added successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } catch (error) {
            console.error("Error saving password:", error);
        }
    };

    const deletePassword = async (id) => {
        const confirmDelete = window.confirm("Do you really wish to delete this password?");
        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:4000/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                });
                if (!response.ok) {
                    throw new Error('Failed to delete password');
                }
                const updatedPasswords = passwordsArray.filter(item => item._id !== id);
                setPasswordsArray(updatedPasswords);
                toast('Password deleted!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } catch (error) {
                console.error("Error deleting password:", error);
            }
        }
    };
    

    const editPassword = (id) => {
        const passwordToEdit = passwordsArray.find(item => item._id === id);
        setForm({ ...passwordToEdit });
        const updatedPasswords = passwordsArray.filter(item => item._id !== id);
        setPasswordsArray(updatedPasswords);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setValidationMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            savePassword();
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <div className="absolute inset-0 -z-10 h-full w-full bg-slate-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
            </div>
            <div className="mx-auto max-w-4xl px-20 min-h-[82vh]">
                <img className="h-48 mt-5 mx-auto" src="/passNinja logo.png" alt="passNinja logo" />
                <p className='text-center text-xl font-poppins font-bold'>Your personal password Ninja</p>
                <div className="text-black flex flex-col p-4 gap-3 items-center">
                    <input value={form.site} onChange={handleChange} className="font-poppins font-bold rounded border border-yellow-400 px-4 py-1 w-full" name="site" type="text" placeholder='Enter Website URL' />
                    <div className="flex  w-full gap-3 justify-between">
                        <input value={form.username} onChange={handleChange} className="font-poppins font-bold rounded border border-yellow-400 px-4 py-1 w-full" name="username" type="text" placeholder='Enter Username' />
                        <div className="relative flex items-center w-full">
                            <input value={form.password} onChange={handleChange} onKeyPress={handleKeyPress} className="font-poppins font-bold rounded border border-yellow-400 px-4 py-1 w-full" type={showPassword ? 'text' : 'password'} placeholder='Enter Password' name="password" ref={inputRef} />
                            <span className='absolute right-0'>
                                <img className="invert m-1 cursor-pointer" src={showPassword ? "/hide password.svg" : "/show password.svg"} onClick={togglePasswordVisibility} alt="eye" ref={imgRef} />
                            </span>
                        </div>
                    </div>
                    <button className='flex justify-center items-center cursor-pointer bg-yellow-300 hover:bg-slate-600 hover:text-yellow-300 w-40 border-2 border-slate-950 border-solid gap-1 rounded p-1 font-poppins font-bold' onClick={savePassword}>
                        <img className='invert' src="/add icon.svg" alt="add icon" />
                        Add Password
                    </button>
                    {validationMessage && <p className="text-red-500 font-poppins font-bold">{validationMessage}</p>}
                </div>
                <div className="passwords">
                    <h2 className='font-poppins font-bold text-center mb-5 text-yellow-300 text-xl bg-slate-600 rounded'>Your passwords</h2>
                    {passwordsArray.length === 0 && <div className='font-poppins font-bold text-center'> No passwords to Show </div>}
                    {passwordsArray.length !== 0 && (
                        <table className="table-auto w-full rounded-md overflow-hidden">
                            <thead className='bg-slate-400 text-yellow-300'>
                                <tr>
                                    <th className='py-1 border-white border-2'>Site</th>
                                    <th className='py-1 border-white border-2'>Username</th>
                                    <th className='py-1 border-white border-2'>Password</th>
                                    <th className='py-1 border-white border-2'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='font-poppins font-semibold bg-slate-100'>
                                {passwordsArray.map((item) => (
                                    <tr key={item._id}>
                                        <td className='text-center border-2 py-2 border-white'>
                                            <div className="flex justify-center items-center">
                                                <span>{item.site}</span>
                                                <div className="cursor-pointer invert" onClick={() => copyText(item.site)}>
                                                    <img src="/copy.svg" alt="copy" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className='text-center border-2 py-2 border-white'>
                                            <div className="flex justify-center items-center">
                                                <span>{item.username}</span>
                                                <div className="cursor-pointer invert" onClick={() => copyText(item.username)}>
                                                    <img src="/copy.svg" alt="copy" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className='text-center border-2 py-2 border-white'>
                                            <div className="flex justify-center items-center">
                                                <span>{item.visible ? item.password : '********'}</span>
                                                <div className="cursor-pointer invert">
                                                    <img src={item.visible ? "/hide password.svg" : "/show password.svg"} alt="eye" onClick={() => togglePasswordVisibilityInTable(item._id)} />
                                                    <img onClick={() => copyText(item.password)} src="/copy.svg" alt="copy" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className='text-center border-2 py-2 border-white'>
                                            <div className="flex justify-center items-center gap-1">
                                                <span className='cursor-pointer invert' onClick={() => editPassword(item._id)}>
                                                    <img src="/edit.svg" alt="edit" />
                                                </span>
                                                <span className='cursor-pointer invert' onClick={() => deletePassword(item._id)}>
                                                    <img src="/delete.svg" alt="delete"/>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default Manager;
