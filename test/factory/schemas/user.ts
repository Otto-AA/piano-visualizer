export const userSchema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            faker: "internet.email"
        },
        password: {
            type: "string",
            faker: "internet.password"
        },
        profile: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    faker: "internet.userName"
                },
                website: {
                    type: "string",
                    faker: "internet.url"
                },
                description: {
                    type: "string",
                    faker: "random.words"
                }
            },
            required: ["name"]
        }
    },
    required: ["email", "password", "profile"]
};