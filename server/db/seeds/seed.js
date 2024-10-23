const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seed = async ({
  usersData,
  categoriesData,
  tagsData,
  postsData,
  commentsData,
}) => {
  try {
    // Clear any existing data
    await prisma.comment.deleteMany();
    await prisma.postMedia.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();

    // Step 1: Seed Users, Categories, and Tags
    await prisma.user.createMany({ data: usersData });
    await prisma.category.createMany({ data: categoriesData });
    await prisma.tag.createMany({ data: tagsData });

    // Step 2: Seed Posts and Handle Relations
    for (const post of postsData) {
      const {
        title,
        content,
        author,
        category,
        created_at,
        likes,
        article_img_url,
        tags,
        video_url,
      } = post;

      // Fetch category and author IDs based on names
      const authorRecord = await prisma.user.findUnique({
        where: { username: author },
      });
      const categoryRecord = await prisma.category.findUnique({
        where: { name: category },
      });

      if (!authorRecord || !categoryRecord) {
        throw new Error("Missing author or category in the database.");
      }

      // Create the post
      const createdPost = await prisma.post.create({
        data: {
          title,
          content,
          author_id: authorRecord.id,
          category_id: categoryRecord.id,
          likes,
          created_at,
        },
      });

      // Step 3: Handle Post Media (if applicable)
      const mediaData = [];
      if (article_img_url) {
        mediaData.push({
          post_id: createdPost.id,
          media_type: "image",
          media_url: article_img_url,
        });
      }
      if (video_url) {
        mediaData.push({
          post_id: createdPost.id,
          media_type: "video",
          media_url: video_url,
        });
      }

      if (mediaData.length) {
        await prisma.postMedia.createMany({ data: mediaData });
      }

      // Associate tags with the post
      for (const tagName of tags) {
        const tagRecord = await prisma.tag.findUnique({
          where: { name: tagName },
        });
        if (tagRecord) {
          await prisma.post.update({
            where: { id: createdPost.id },
            data: {
              tags: { connect: { id: tagRecord.id } },
            },
          });
        }
      }
    }

    // Step 4: Seed Comments
    for (const comment of commentsData) {
      const { post_id, user_id, comment_text, created_at } = comment;

      // Check if the post exists
      const postRecord = await prisma.post.findFirst({
        where: { title: post_id },
      });
      if (!postRecord) {
        throw new Error(`Post with title "${post_id}" not found.`);
      }

      // Check if the user exists
      const userRecord = await prisma.user.findUnique({
        where: { username: user_id }, // Change this if your user ID is not the username
      });
      if (!userRecord) {
        throw new Error(`User with ID "${user_id}" not found.`);
      }

      // Create the comment
      await prisma.comment.create({
        data: {
          post_id: postRecord.id,
          user_id: userRecord.id, // Use the correct user ID
          comment_text,
          created_at,
        },
      });
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = seed;
