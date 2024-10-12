# SnapShare

SnapShare is a live-hosted social media backend web application built using NestJS and Express, inspired by Instagram but with enhanced functionalities. The project focuses on providing a seamless social networking experience by implementing custom algorithms that prioritize user interactions in unique ways.



## Features

- Authentication System

Secure login and sign-up processes using JWT (JSON Web Tokens) for authentication, ensuring robust user verification and session management.

- User Profiles

Manage personal information and privacy settings, and view others’ profiles. Profiles can be either private or public. For private profiles, users must be part of the owner’s network to view their posts and stories.

- Posts and Stories

Create and interact with posts and stories, including liking and commenting. SnapShare also provides APIs for retrieving post data, with options to archive posts to remove them from your public profile layout. Most GET methods implement pagination to handle large data sets efficiently.

- Feed

The user feed is personalized using a custom algorithm that prioritizes key aspects of user interaction. Factors include the user’s personal engagement with posts/stories, the total engagement with the wider SnapShare community and the content's recency. The feed is paginated to ensure smooth performance and better user experience.

- User Networking

Request, accept, or reject friend requests. Manage your network by following/unfollowing users or removing friends from your network.

- Search and Discover

Search for users and posts using an optimized search bar, ensuring fast and accurate results. Search results are paginated for efficient data handling.

- Comments and Likes

SnapShare provides APIs for liking and commenting on various types of content, enabling seamless interaction with posts and stories. Comment and like data retrieval is also paginated.

- Notification System

An API that tracks and returns the count of unseen notifications. Another API delivers notifications related to engagement with the user’s content and interactions within their friends' network.

## Technologies Used

- Database: PostgreSQL
- Backend Framework: NestJS / Express
- Authentication: JWT (JSON Web Tokens)
- API Documentation: Swagger
- ORM/Database Interaction: TypeORM
- Caching: CacheManager
- Deployment: Render
- Version Control: Git / GitHub
- Task Runner: npm 
## Documentation

The public domain name for the SnapShare application is:
https://snapshare-zw9v.onrender.com

All project APIs are documented using Swagger. You can access the complete API documentation by visiting:
https://snapshare-zw9v.onrender.com/api


## Usage and  Setup

To use the SnapShare APIs, the Swagger API documentation is available at:  
**[SnapShare Documentation](https://snapshare-zw9v.onrender.com/api#/)**

You can access the live-hosted web application at:  
**[SnapShare](https://snapshare-zw9v.onrender.com/)**

To set up SnapShare locally, follow these commands:

1. *Clone the repository from the development branch*:
   ```bash
   git clone -b development https://github.com/rigelHadushiDev/SnapShare.git

2. *Run npm Install*:
   ```bash
   npm install

3. *Run the Application*:
   ```bash
   npm run satrt:dev

   
## Contact Information

If you have any questions or would like to connect, feel free to reach out:

- **LinkedIn**: [rigelhadushi](www.linkedin.com/in/rigel-hadushi)  
- **Email**: rigelhadushi4@gmail.com
