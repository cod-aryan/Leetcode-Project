# Leetcode-Project

## Backend - Learning
1) Paging - in getAllProblems
2) Indexing compound keys in submission schema.
3) If I delete user then submission of that user automatically deleted.
4) CORS
5) How to make customized field in schema - In problem schema, like visibleTestCases or hiddenTestCases.
6) How to use redis for storing logout jwt tokens.
7) Ordering of imports - we should have to import 'dotenv/config' first.
8) Using Glot IO for submitting problems to verify the code written by the user to get result on the basis of given input and expected output (we can also use JudgeO but Glot IO is free)


## Frontend - Learning
1) axiosClient creation
2) Creating context for storing user information.
3) Type of navigation in react-router-dom:
    a) using Link, NavLink
    b) using navigate = useNavigate
    c) using <Navigate to='/' replace />
4) different types of method to create form in react:
    a) useState variables - multiple re-renders on every time user interact with the form
    b) useRef variables
    c) useFrom and zod - react-hook-form
5) Light & Dark modes
6) useLocation in react-router-dom, it is equivalent to window.location
7) lucide-react is used for icons
8) Monaco editor is used to create editor like in VS Code
9) Use Cloudinary to upload videos/images or any content files


## Docker - Learning
1) Creating image:- docker build -t my-mern-backend:v1 .
2) Creating container:- docker run -d -p 3000:3000 --name leetcode-api-container --env-file .env leetcode-project:v1
    -d:- to run in backend
    -p:- to map ports from container to machine or system
    --env-file .env:- to run container with environment variables inside .env file
3) To stop container:- docker stop leetcode-api-container
4) To check logs:- docker logs -f leetcode-api-container
5) To remove container:- docker rm -f leetcode-api-container
6) To remove image:- docker rmi my-mern-backend:v1 OR docker rmi c8392a1cf4b
7) To safely wipe out all stopped containers, unused networks, and dangling build caches:- docker system prune -a --volumes
8) To build all containers inside docker-compose:- docker compose up --build
9) To make changes to docker-compose:- docker compose up
10) To stop all containers of docker-compose:- docker compose down
11) To check logs:- docker compose logs -f