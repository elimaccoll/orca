import { client } from "../index";

const DELIM = ".";

const getGradingJobFromSubmissionId = async (
  submission_id: string
): Promise<string> => {
  const grading_job = await client.get(`QueuedGradingInfo.${submission_id}`);
  // Returns empty string if grading job was not found
  return grading_job === null ? "" : grading_job;
};

const getGradingQueue = async (): Promise<string[]> => {
  return await client.zRange("GradingQueue", 0, -1);
};

const getSubmitterSubmissions = async (
  submitter: string
): Promise<string[]> => {
  return await client.lRange(`SubmitterInfo.${submitter}`, 0, -1);
};

const getUniqueSubmitters = (grading_queue: string[]): string[] => {
  // Get all submitters
  const all_submitters: string[] = grading_queue.map((key: string) => {
    // Ex: [<"team" | "user" | "sub">, "123", "1662660903246"]
    const key_split: string[] = key.split(DELIM);
    key_split.pop();
    const submitter_info_key: string = key_split.join(DELIM);
    return submitter_info_key;
  });
  // Narrow to unique submitters
  const unique_submitters: string[] = [...new Set(all_submitters)];
  return unique_submitters;
};

type SubmitterInfoObj = {
  submitter: string;
  submissions: string[];
};
type SubmitterInfo = {
  [submitter: string]: string[];
};

const getSubmitterInfo = async (
  submitters: string[]
): Promise<SubmitterInfo> => {
  // Get the submission list for each submitter
  const submitter_info_list: Promise<SubmitterInfoObj>[] = submitters.map(
    async (submitter: string) => {
      const submissions: string[] = await getSubmitterSubmissions(submitter);
      return { submitter: submitter, submissions: submissions };
    }
  );

  // Format to SubmitterInfo type
  const submitter_info_list_res: SubmitterInfoObj[] = await Promise.all(
    submitter_info_list
  );
  let submitter_info: SubmitterInfo = {};
  submitter_info_list_res.map((entry: SubmitterInfoObj) => {
    submitter_info[entry.submitter] = entry.submissions;
    return;
  });
  return submitter_info;
};

// TODO: Type this
const getGradingJobs = async () => {
  const grading_queue: string[] = await getGradingQueue();
  const submitters: string[] = getUniqueSubmitters(grading_queue);
  const submitter_info = await getSubmitterInfo(submitters);

  // Grading queue is in order of increasing release timestamp
  const grading_jobs = grading_queue.map(async (key: string) => {
    const key_split: string[] = key.split(DELIM);
    const nonce: string = key_split.pop()!;
    const submitter: string = key_split.join(DELIM);
    const submission_id: string = submitter_info[submitter].pop()!;
    const grading_job = await getGradingJobFromSubmissionId(submission_id);
    if (!grading_job) {
      // Error
      return;
    }
    const json_grading_job = { nonce: nonce, ...JSON.parse(grading_job) };
    return json_grading_job;
  });

  const results = await Promise.all(grading_jobs);
  return results;
};

// const getGradingQueue = async () => {
/*
  const grading_info_keys: string[] = await client.keys("QueuedGradingInfo.*");
  // TODO: Make and enforce interface model for grading job info
  //   const grading_jobs = await getGradingJobsFromKeys(grading_info_keys);
  let grading_jobs: Object[] = [];
  for (let i = 0; i < grading_info_keys.length; i++) {
    const key = grading_info_keys[i];
    const redis_grading_job = await client.get(key);
    if (!redis_grading_job) {
      // Error retrieving grading job
      // TODO: If getting a key fails for some reason -- returns null
      // do we want the rest of the list?  Or just say it failed?
      return;
    }
    const grading_job = JSON.parse(redis_grading_job);
    grading_jobs.push(grading_job);
  }
  grading_jobs.sort((a, b) => (a["priority"] > b["priority"] ? 1 : -1));
  return grading_jobs;
  */

export default getGradingJobs;
