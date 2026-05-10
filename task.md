# Hackathon Improvements

## Tasks

- [x] Backend: Support winner filtering in judging results
  - [x] Update `JudgingResultsQueryDto` with `onlyWinners` flag
  - [x] Update `JudgingRepository` to filter by rank when `onlyWinners` is true (Prisma-level)
  - [x] Update `JudgingService.publishResults` to limit rank assignment to actual winners
  - [x] Update `JudgingService.publishResults` to send separate notifications for winners and participants
  - [x] Update `OrganizationHackathonsJudgingController.getWinnerRanking` to use `onlyWinners` flag
- [x] Frontend: Fix judging metrics and isolate pagination
  - [x] Update `judging/page.tsx` metrics to use `totalPossibleSubmissions`
  - [x] Split pagination states for Overview and Results tabs
  - [x] Update fetch functions (`fetchData`, `fetchResults`) to use dedicated pagination
  - [x] Reset page to 1 on tab-specific search/sort changes
- [x] Verification and Testing
  - [x] Manual logic verification and code review
- [x] Add project logo to winners data in `HackathonsService` and DTO <!-- id: 7 -->
- [x] Fix prize amount formatting (e.g., "29 USDC" instead of "USDC29") <!-- id: 8 -->
- [x] Fix judging submissions response mapping in `JudgingService` <!-- id: 9 -->
- [x] Fix missing `myScore` in judging submissions response <!-- id: 10 -->
- [x] Fix winner results limit in `JudgingService` (Prisma-level filtering) <!-- id: 12 -->
- [x] Separate winner and participant notifications during publication <!-- id: 13 -->
- [x] Address lint errors in `HackathonsService` and `JudgingRepository` <!-- id: 11 -->
