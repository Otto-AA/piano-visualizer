const user = {
    "user_id": "____default_user____",
    "user_name": "____default_user____",
    "description": "It's a me, Mario!",
    "email": "user@example.com",
    "password": "myPass007"
}

module.exports.getTestData = () => {
    return {
        user: {...user }
    }
}