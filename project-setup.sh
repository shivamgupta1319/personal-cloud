# Create project directory
mkdir personal-cloud
cd personal-cloud

# Initialize backend
nest new backend
cd backend

# Install necessary dependencies
npm install @nestjs/typeorm typeorm pg @nestjs/jwt @nestjs/passport passport passport-jwt @aws-sdk/client-s3

# Initialize frontend
cd ..
npx create-next-app@latest frontend --typescript
cd frontend

# Install frontend dependencies
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion axios 