import { createQueue, createWorker, type Job } from "@/lib/queue";

interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export const emailQueue = createQueue("email");

export const emailWorker = createWorker<EmailJobData>(
  "email",
  async (job: Job<EmailJobData>) => {
    console.log(`Sending email to ${job.data.to}: ${job.data.subject}`);
    // Integrate with your email provider here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Email sent to ${job.data.to}`);
  }
);

// Usage: await emailQueue.add("send-welcome", { to: "user@example.com", subject: "Welcome!", body: "..." });
