from splinter.apps.activity.activities import ActivityType

CreateExpenseActivity = ActivityType(verb='expense', template='{actor} added {object}')
UpdateExpenseActivity = ActivityType(verb='update_expense', template='{actor} updated {target}')
DeleteExpenseActivity = ActivityType(verb='delete_expense', template='{actor} deleted {object}')
SettleUpActivity = ActivityType(verb='settle_up', template='{actor} settled up with {target}')

CreatePaymentActivity = ActivityType(verb='payment', template='{actor} paid {target}')
UpdatePaymentActivity = ActivityType(verb='update_payment', template='{actor} updated a payment to {target}')
DeletePaymentActivity = ActivityType(verb='delete_payment', template='{actor} deleted a payment to {target}')
