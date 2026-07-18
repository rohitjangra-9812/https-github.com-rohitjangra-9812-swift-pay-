import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight, UserPlus, BookmarkPlus, Trash2, User } from "lucide-react";
import { toast } from "sonner";

interface RecipientInputProps {
  type: "upi" | "account" | "mobile";
  onSubmit: (data: { upiId: string; merchant: string }) => void;
}

export const RecipientInput = ({ type, onSubmit }: RecipientInputProps) => {
  const [value, setValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  
  const [savedContacts, setSavedContacts] = useState<{name: string, upiId: string}[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");

  useEffect(() => {
    const contacts = JSON.parse(localStorage.getItem("swiftpay_saved_contacts") || "[]");
    setSavedContacts(contacts);
  }, []);

  const saveContact = (name: string, upiId: string) => {
    const newContacts = [...savedContacts, { name, upiId }];
    setSavedContacts(newContacts);
    localStorage.setItem("swiftpay_saved_contacts", JSON.stringify(newContacts));
    toast.success("Contact saved successfully!");
    setIsAddingContact(false);
    setNewContactName("");
  };

  const deleteContact = (upiId: string) => {
    const newContacts = savedContacts.filter(c => c.upiId !== upiId);
    setSavedContacts(newContacts);
    localStorage.setItem("swiftpay_saved_contacts", JSON.stringify(newContacts));
    toast.success("Contact removed.");
  };

  const handleSelectContact = async () => {
    try {
      if ('contacts' in navigator) {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        const contacts = await (navigator as any).contacts.select(props, opts);
        if (contacts && contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
          const rawTel = contacts[0].tel[0];
          setValue(rawTel.replace(/\D/g, '').slice(-10));
        }
      } else {
        toast.info("Contacts API not supported. Using mock number.");
        setValue("9876543210");
      }
    } catch (ex) {
      console.error(ex);
      toast.info("Using mock number.");
      setValue("9876543210");
    }
  };

  const validateInput = () => {
    if (type === "upi") {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(value)) {
        setError("Invalid UPI ID format. Try something like name@bank");
        return false;
      }
    } else if (type === "account") {
      const accRegex = /^\d{9,18}$/;
      if (!accRegex.test(value)) {
        setError("Invalid Account Number. Should be 9-18 digits.");
        return false;
      }
    } else if (type === "mobile") {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(value.replace(/\D/g, ''))) {
        setError("Invalid Mobile Number. Should be 10 digits.");
        return false;
      }
    }
    return true;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    if (!validateInput()) return;

    setIsValidating(true);
    setError("");

    // Simulate verification
    setTimeout(() => {
      if (type === "upi") {
        const validHandles = ["ybl", "okhdfcbank", "okaxis", "oksbi", "okicici", "paytm", "axl", "ibl", "sib", "api", "swiftpay"];
        const [, handle] = value.split("@");
        
        if (!handle || !validHandles.includes(handle.toLowerCase())) {
          setError(`Invalid UPI handle. Valid handles include: @${validHandles.slice(0, 3).join(", @")}...`);
          setIsValidating(false);
          return;
        }
      }
      
      setIsValidating(false);
      let mockName = "Verified User";
      let upiId = value;
      const names = ["Rahul Kumar", "Priya Singh", "Amit Sharma", "Neha Gupta", "Vikram Patel", "Sneha Reddy"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      if (type === "upi") {
        mockName = newContactName || randomName;
      } else if (type === "account") {
        mockName = `${randomName} (A/C Holder)`;
      } else if (type === "mobile") {
        mockName = randomName;
        upiId = `${value.replace(/\D/g, '')}@swiftpay`;
      }

      if (isAddingContact && type === 'upi') {
         saveContact(newContactName || mockName, value);
      }

      onSubmit({ upiId: upiId, merchant: mockName });
    }, 200);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white">
          {type === "upi" ? "Enter UPI ID" : type === "account" ? "Enter Account Number" : "Enter Mobile Number"}
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          {type === "upi" ? "Send money to any UPI app" : type === "account" ? "Direct bank transfer" : "Pay to phone number"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="mb-6 relative">
          <input
            type={type === "account" || type === "mobile" ? "tel" : "text"}
            placeholder={type === "upi" ? "e.g. rohit@bank" : type === "account" ? "Enter Account Number" : "Mobile Number"}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors pr-12"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            autoFocus
          />
          {type === "mobile" && (
             <button 
                type="button" 
                onClick={handleSelectContact}
                className="absolute right-3 top-3 text-slate-400 hover:text-indigo-400"
                title="Select Contact"
             >
                <UserPlus className="w-5 h-5" />
             </button>
          )}
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {type === "upi" && !isAddingContact && (
           <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setIsAddingContact(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <BookmarkPlus className="w-3.5 h-3.5" /> Save this contact
              </button>
           </div>
        )}

        {type === "upi" && isAddingContact && (
          <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs text-indigo-200 mb-2 uppercase tracking-wider font-semibold">Contact Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Rohit Jangra"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-3 gap-3">
              <button 
                type="button" 
                onClick={() => setIsAddingContact(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!value || isValidating}
          className="w-full bg-indigo-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-800 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
        >
          {isValidating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
          ) : (
            <>Continue <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {type === "upi" && savedContacts.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Saved Contacts</h4>
          <div className="space-y-3">
            {savedContacts.map((contact, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition-colors group"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    setValue(contact.upiId);
                    onSubmit({ upiId: contact.upiId, merchant: contact.name });
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-bold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{contact.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{contact.upiId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteContact(contact.upiId)}
                  className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
