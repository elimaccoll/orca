import {
  Collation,
  GradingJob,
  GradingJobConfig,
} from "../grading-queue/types";
import {
  redisExists,
  redisLRange,
  redisLRem,
  redisSPopOne,
  redisSRem,
  redisZAdd,
  redisZRem,
} from "./redis";

export const nonImmediateJobExists = async (
  key: string,
  collation: Collation,
): Promise<[boolean | null, Error | null]> => {
  const [submitterInfo, submitterInfoErr] = await getSubmitterInfo(
    `SubmitterInfo.${collation.type}.${collation.id}`,
  );
  if (submitterInfoErr) return [null, submitterInfoErr];
  for (let jobKey in submitterInfo!) {
    if (jobKey === key) return [true, null];
  }
  return [false, null];
};

export const jobInQueue = async (
  key: string,
): Promise<[boolean | null, Error | null]> => {
  const [exists, existsErr] = await redisExists(key);
  if (existsErr) return [null, existsErr];
  return [exists ? true : false, null];
};

export const generateGradingJobFromConfig = (
  gradingJobConfig: GradingJobConfig,
  arrivalTime: number,
  releaseTime: number,
): GradingJob => {
  const gradingJob: GradingJob = {
    ...gradingJobConfig,
    release_at: releaseTime,
    created_at: arrivalTime,
  };
  return gradingJob;
};

export const addToReservations = async (
  value: string,
  score: number,
): Promise<Error | null> => {
  // should always be 1 since we only ever add 1 entry at time
  const [numAdded, zAddErr] = await redisZAdd("Reservations", score, value);
  if (zAddErr) return zAddErr;
  if (numAdded !== 1) return Error("Error while creating reservation.");
  return null;
};

export const filterNull = (arr: any[]): any[] => {
  return arr.filter((x) => x);
};

export const getSubmitterInfo = async (
  submitterInfoKey: string,
): Promise<[string[] | null, Error | null]> => {
  const [submitterInfo, lRangeErr] = await redisLRange(submitterInfoKey, 0, -1);
  if (lRangeErr) return [null, lRangeErr];
  if (!submitterInfo)
    return [
      null,
      Error(
        "Failed to retrieve submitter info for given submitter when moving grading job.",
      ),
    ];
  return [submitterInfo, null];
};

export const removeNonImmediateJob = async (
  key: string,
  collation: Collation,
): Promise<null | Error> => {
  const collationKey = `${collation.type}.${collation.id}`;
  const submitterInfoKey = `SubmitterInfo.${collationKey}`;

  const [numLRemoved, lRemErr] = await redisLRem(submitterInfoKey, key);
  if (lRemErr) return lRemErr;
  if (numLRemoved !== 1)
    return Error(
      "Something went wrong while removing key from submitter info for existing non-immediate job.",
    );

  const [nonce, sPopErr] = await redisSPopOne(`Nonces.${collationKey}`);
  if (sPopErr) return sPopErr;
  if (!nonce)
    return Error(
      "Something went wrong while removing nonce for non-immediate job.",
    );

  const [numZRemoved, zRemErr] = await redisZRem(
    "Reservations",
    `${collationKey}.${nonce}`,
  );
  if (zRemErr) return zRemErr;
  if (numZRemoved !== 1)
    return Error(
      "Something went wrong while removing reservation for existing non-immediate job.",
    );
  return null;
};

const getJobKeyIndexInSubmitterInfo = async (
  jobKey: string,
  submitterInfoKey: string,
): Promise<[number | null, Error | null]> => {
  const [submitterInfo, submitterInfoErr] = await getSubmitterInfo(
    submitterInfoKey,
  );
  if (submitterInfoErr) return [null, submitterInfoErr];
  return [submitterInfo!.indexOf(jobKey), null];
};
