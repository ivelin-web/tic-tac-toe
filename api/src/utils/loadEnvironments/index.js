import dotenv from "dotenv";

const loadEnvironments = () => {
    if (process.env.NODE_ENV) {
        dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
    }

    dotenv.config();
};

export default loadEnvironments;
