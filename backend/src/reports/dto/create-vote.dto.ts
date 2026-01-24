import { IsInt, Min, Max } from 'class-validator';

export class CreateVoteDto {
    @IsInt()
    @Min(-1)
    @Max(1)
    value!: number; // 1 for upvote, -1 for downvote
}
