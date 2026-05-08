from splinter.apps.activity.activities import ActivityType

CreateExpenseActivity = ActivityType(verb='expense', template='{actor} added {object}')
UpdateExpenseActivity = ActivityType(verb='update_expense', template='{actor} updated {object}')
DeleteExpenseActivity = ActivityType(verb='delete_expense', template='{actor} deleted {object}')
RestoreExpenseActivity = ActivityType(verb='restore_expense', template='{actor} restored {object}')
SettleUpActivity = ActivityType(verb='settle_up', template='{actor} settled up with {target}')

CreatePaymentActivity = ActivityType(verb='payment', template='{actor} paid {target}')
UpdatePaymentActivity = ActivityType(verb='update_payment', template='{actor} updated a payment: {object}')
DeletePaymentActivity = ActivityType(verb='delete_payment', template='{actor} deleted a payment: {object}')
RestorePaymentActivity = ActivityType(verb='restore_payment', template='{actor} restored a payment: {object}')
