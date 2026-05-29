The waitlist popup currently shows its close button after 3 seconds. Increase this delay to 1 minute (60,000 ms) so users have more time to review the offer before they can dismiss the popup.

### Technical change
In `src/components/WaitlistPopup.tsx`, change line 28 from:
```
const t = window.setTimeout(() => setCanClose(true), 3000);
```
to:
```
const t = window.setTimeout(() => setCanClose(true), 60000);
```

No other logic or UI changes are needed. The existing "• • •" placeholder and the close button styling remain the same.