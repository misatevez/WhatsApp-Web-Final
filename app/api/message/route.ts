import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
    console.log("[POST /api/message] Starting status callback processing");
    
    try {
        // Log all headers for debugging
        const headersList = headers();
        const allHeaders = Object.fromEntries(headersList.entries());
        console.log("[POST /api/message] Received headers:", allHeaders);
        
        const twilioSignature = headersList.get('x-twilio-signature');
        console.log("[POST /api/message] Twilio signature:", twilioSignature);
        
        if (!twilioSignature) {
            console.error("[POST /api/message] Missing Twilio signature");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse and log form data
        const formData = await req.formData();
        const formDataObj = Object.fromEntries(formData.entries());
        console.log("[POST /api/message] Received form data:", formDataObj);

        const messageStatus = formData.get('MessageStatus');
        const messageSid = formData.get('MessageSid');
        const to = formData.get('To')?.toString().replace('whatsapp:+', '');
        const from = formData.get('From');
        const body = formData.get('Body');

        console.log("[POST /api/message] Parsed message details:", {
            messageStatus,
            messageSid,
            to,
            from,
            body
        });

        if (!to || !messageSid) {
            console.error("[POST /api/message] Missing required fields:", { to, messageSid });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Update message status in Firestore
        const chatRef = doc(db, "chats", to);
        console.log("[POST /api/message] Updating chat document:", to);
        
        const timestamp = new Date().toISOString();
        let updateData = {};

        switch (messageStatus) {
            case 'sent':
                updateData = {
                    lastMessageStatus: 'sent',
                    lastMessageStatusTimestamp: timestamp
                };
                break;
            
            case 'delivered':
                updateData = {
                    lastMessageStatus: 'delivered',
                    lastMessageStatusTimestamp: timestamp
                };
                break;
            
            case 'read':
                updateData = {
                    lastMessageStatus: 'read',
                    lastMessageStatusTimestamp: timestamp,
                    lastReadAt: timestamp
                };
                break;
            
            case 'failed':
            case 'undelivered':
                const errorMessage = formData.get('ErrorMessage');
                updateData = {
                    lastMessageStatus: 'failed',
                    lastMessageStatusTimestamp: timestamp,
                    lastError: errorMessage || 'Unknown error'
                };
                break;
        }

        console.log("[POST /api/message] Updating with data:", updateData);
        
        await updateDoc(chatRef, updateData);
        console.log("[POST /api/message] Successfully updated chat document");

        return NextResponse.json({ 
            success: true,
            updated: updateData
        });
    } catch (error: any) {
        console.error("[POST /api/message] Error processing status callback:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        return NextResponse.json({ 
            error: "Internal server error",
            details: error.message
        }, { status: 500 });
    }
}

