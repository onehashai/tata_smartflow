// Copyright (c) 2025, sukhman@onehash.ai and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Tata Tele Users", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Tata Tele Users', {
    refresh(frm) {
        if (frm.doc.id) {
            frm.add_custom_button(__('Delete User from Tata Tele'), function() {
                delete_user_from_tata_tele(frm);
            });
        }
    }
});

function delete_user_from_tata_tele(frm) {
    frappe.confirm(
        'This action will delete the user from Tata Tele as well. Do you want to proceed?',
        function() {
            frappe.call({
                method: 'tata_smartlfow_onehash_integration.tata_smartlfow_onehash_integration.doctype.tata_tele_users.tata_tele_users.delete_user',
                args: {
                    docname: frm.doc.name
                },
                freeze: true,
                freeze_message: __('Deleting user from Tata Tele...'),
                callback: function(r) {
                    if (r.message) {
                        if (r.message.success) {
                            frappe.msgprint({
                                title: __('Success'),
                                message: r.message.message,
                                indicator: 'green'
                            });
                            frm.reload_doc();
                        } else {
                            frappe.msgprint({
                                title: __('Error'),
                                message: r.message.message,
                                indicator: 'red'
                            });
                        }
                    }
                },
                error: function(r) {
                    frappe.msgprint({
                        title: __('Error'),
                        message: __('An error occurred while deleting the user'),
                        indicator: 'red'
                    });
                }
            });
        },
        function() {
            frappe.show_alert({
                message: __('User deletion cancelled'),
                indicator: 'blue'
            });
        }
    );
}