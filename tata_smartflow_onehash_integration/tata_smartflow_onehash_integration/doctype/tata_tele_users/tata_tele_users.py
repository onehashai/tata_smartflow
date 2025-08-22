# Copyright (c) 2025, sukhman@onehash.ai and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import http.client
import json


class TataTeleUsers(Document):
	pass

@frappe.whitelist()
def delete_user(docname):
    try:
        user_doc = frappe.get_doc("Tata Tele Users", docname)
        
        if not user_doc.id:
            return {
                "success": False,
                "message": "User ID not found in document"
            }
        
        settings = frappe.get_single("Tata Tele API Cloud Settings")
        
        auth_token = frappe.utils.password.get_decrypted_password(
            "Tata Tele API Cloud Settings",
            "Tata Tele API Cloud Settings",
            "api_token"
        )
        base_url = settings.url
        endpoint = f"/v1/user/{user_doc.id}"
        
        conn = http.client.HTTPSConnection(base_url)
        conn.request(
            "DELETE",
            endpoint,
            headers={
                "accept": "application/json",
                "Authorization": auth_token
            }
        )
        
        response = conn.getresponse()
        response_data = json.loads(response.read().decode("utf-8"))
        
        if response_data.get("success") == True:
            user_doc.delete(ignore_permissions=True)
            frappe.db.commit()
            
            return {
                "success": True,
                "message": response_data.get("message", "User deleted successfully from Tata Tele")
            }
        else:
            return {
                "success": False,
                "message": response_data.get("message", "Failed to delete user from Tata Tele"),
                "error": response_data.get("error", None)
            }
            
    except Exception as e:
        frappe.log_error(f"Delete user error: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to delete user: {str(e)}"
        }