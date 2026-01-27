import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@prisma/client';

/**
 * Security Topic Definitions
 * Each topic has keywords, synonyms, and role-specific responses
 */
interface SecurityTopic {
    id: string;
    keywords: string[];
    getResponse: (role: UserRole, isPrivileged: boolean) => string;
}

@Injectable()
export class ChatbotService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditService,
    ) { }

    // --- SECURITY TOPICS (30+) ---
    private readonly securityTopics: SecurityTopic[] = [
        // 1. ACCOUNT COMPROMISE / HACKED
        {
            id: 'account_hacked',
            keywords: ['hacked', 'compromised', 'breach', 'someone accessed', 'unauthorized access', 'account taken', 'hijacked', 'break in', 'broken into'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Account Compromise Response Protocol**\n\n` +
                `**Immediate Actions:**\n` +
                `1. **DISABLE** the compromised account in Active Directory\n` +
                `2. **REVOKE** all active sessions and tokens\n` +
                `3. **AUDIT** recent login history and IP addresses\n` +
                `4. **CHECK** for lateral movement to other systems\n` +
                `5. **PRESERVE** logs for forensic analysis\n\n` +
                `**Recovery:**\n` +
                `• Force password reset with complexity requirements\n` +
                `• Enable MFA before re-enabling account\n` +
                `• Monitor for 30 days post-incident`
                : `**Your Account May Be Compromised - Take Action Now**\n\n` +
                `1. **CHANGE** your password immediately from a trusted device\n` +
                `2. **ENABLE** Two-Factor Authentication (2FA)\n` +
                `3. **CHECK** your recent login activity for unfamiliar locations\n` +
                `4. **REPORT** this incident using the Submit Report form\n` +
                `5. **LOG OUT** of all other sessions\n\n` +
                `Do NOT use the same password anywhere else!`
        },
        // 2. PASSWORD SECURITY
        {
            id: 'password_security',
            keywords: ['password', 'credential', 'login', 'strong password', 'password exposed', 'password leak', 'credential reuse', 'same password'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Password Security Best Practices (Admin)**\n\n` +
                `**Policy Enforcement:**\n` +
                `• Minimum 12 characters with complexity\n` +
                `• Password history of 24 previous passwords\n` +
                `• Maximum age: 90 days\n` +
                `• Account lockout after 5 failed attempts\n\n` +
                `**Detection:**\n` +
                `• Monitor for credential stuffing patterns\n` +
                `• Check Have I Been Pwned integration\n` +
                `• Alert on password spray attacks`
                : `**Creating Strong Passwords**\n\n` +
                `**DO:**\n` +
                `* Use 12+ characters mixing letters, numbers, symbols\n` +
                `* Use a unique password for each account\n` +
                `* Consider using a password manager\n` +
                `* Enable 2FA wherever possible\n\n` +
                `**DON'T:**\n` +
                `* Use personal info (birthdays, pet names)\n` +
                `* Reuse passwords across sites\n` +
                `* Share passwords with anyone`
        },
        // 3. PHISHING ATTACKS
        {
            id: 'phishing',
            keywords: ['phishing', 'suspicious email', 'fake email', 'scam email', 'fishing', 'click link', 'verify account', 'urgent action', 'email scam'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Phishing Incident Response Protocol**\n\n` +
                `**Containment:**\n` +
                `1. Block sender domain at email gateway\n` +
                `2. Quarantine similar messages organization-wide\n` +
                `3. Identify all recipients who received the email\n\n` +
                `**Remediation:**\n` +
                `4. Force password reset for anyone who clicked\n` +
                `5. Scan affected endpoints for malware\n` +
                `6. Submit malicious URLs to blocklists\n\n` +
                `**Analysis:**\n` +
                `• Extract IOCs (URLs, domains, file hashes)\n` +
                `• Check threat intel feeds for campaign attribution`
                : `**Phishing Email Defense**\n\n` +
                `**Warning Signs:**\n` +
                `• Urgent language ("Act now!", "Account suspended!")\n` +
                `• Sender address looks wrong (e.g., support@amaz0n.com)\n` +
                `• Generic greeting ("Dear Customer")\n` +
                `• Suspicious links (hover to check before clicking)\n\n` +
                `**If You Receive a Suspicious Email:**\n` +
                `1. DO NOT click any links or attachments\n` +
                `2. Report it via Submit Report\n` +
                `3. Delete the email\n\n` +
                `When in doubt, contact IT directly!`
        },
        // 4. SOCIAL ENGINEERING
        {
            id: 'social_engineering',
            keywords: ['social engineering', 'manipulated', 'tricked', 'pretexting', 'impersonation', 'pretending to be', 'caller claimed', 'vishing', 'smishing'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Social Engineering Defense (Security Team)**\n\n` +
                `**Attack Vectors:**\n` +
                `• Phone (Vishing) - Fake IT support calls\n` +
                `• SMS (Smishing) - Text messages with links\n` +
                `• In-person - Tailgating, impersonation\n` +
                `• Email - Pretexting, authority exploitation\n\n` +
                `**Countermeasures:**\n` +
                `• Implement callback verification procedures\n` +
                `• Train staff on verification protocols\n` +
                `• Create code words for sensitive requests\n` +
                `• Physical access badges with photo ID`
                : `**Protecting Yourself from Social Engineering**\n\n` +
                `Social engineering tricks people into revealing information.\n\n` +
                `**Red Flags:**\n` +
                `• Someone asks for your password (IT never will!)\n` +
                `• Pressure to act quickly or secretly\n` +
                `• Requests to bypass normal procedures\n` +
                `• Appeals to authority or fear\n\n` +
                `**Always:**\n` +
                `* Verify caller identity through official channels\n` +
                `* Take time to think - urgency is a manipulation tactic\n` +
                `* Report suspicious approaches to IT`
        },
        // 5. MALWARE / VIRUS
        {
            id: 'malware',
            keywords: ['malware', 'virus', 'infected', 'trojan', 'worm', 'spyware', 'adware', 'popup', 'slow computer', 'strange behavior'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Malware Incident Response**\n\n` +
                `**Immediate Containment:**\n` +
                `1. Isolate endpoint from network (VLAN/unplug)\n` +
                `2. Preserve volatile memory before shutdown\n` +
                `3. Create disk image for forensics\n\n` +
                `**Analysis:**\n` +
                `4. Identify malware family and IOCs\n` +
                `5. Scan network for lateral movement\n` +
                `6. Check C2 communication in firewall logs\n\n` +
                `**Recovery:**\n` +
                `• Reimage from known-good gold master\n` +
                `• Reset all credentials used on that system\n` +
                `• Monitor for persistence mechanisms`
                : `**Malware Warning Signs & Response**\n\n` +
                `**Signs of Infection:**\n` +
                `• Computer running unusually slow\n` +
                `• Unexpected popups or ads\n` +
                `• Programs opening/closing on their own\n` +
                `• Files missing or encrypted\n\n` +
                `**If You Suspect Malware:**\n` +
                `1. DISCONNECT from WiFi/network immediately\n` +
                `2. DON'T log into any accounts\n` +
                `3. SHUT DOWN the device\n` +
                `4. BRING it to IT Support (Room 304)\n\n` +
                `Note: Don't try to fix it yourself - you might spread it!`
        },
        // 6. RANSOMWARE
        {
            id: 'ransomware',
            keywords: ['ransomware', 'files encrypted', 'bitcoin', 'ransom', 'locked files', 'decrypt', 'pay', 'hostage'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Ransomware Incident Response**\n\n` +
                `**CRITICAL - Do NOT:**\n` +
                `* Pay the ransom\n` +
                `* Negotiate with attackers\n` +
                `* Reboot infected systems\n\n` +
                `**Immediate Actions:**\n` +
                `1. Isolate ALL potentially affected systems\n` +
                `2. Disable network shares and mapped drives\n` +
                `3. Preserve ransom note and encrypted samples\n` +
                `4. Check No More Ransom project for decryptors\n` +
                `5. Activate incident response team\n` +
                `6. Consider law enforcement notification\n\n` +
                `**Recovery:**\n` +
                `• Restore from offline/air-gapped backups\n` +
                `• Validate backup integrity before restore`
                : `**Ransomware - What To Do**\n\n` +
                `If you see a message demanding payment to unlock your files:\n\n` +
                `1. **DO NOT PAY** - Payment encourages attackers\n` +
                `2. **DISCONNECT** from network immediately\n` +
                `3. **DO NOT** turn off the computer\n` +
                `4. **CALL IT** immediately: Extension 5555\n` +
                `5. **TAKE A PHOTO** of the ransom message\n\n` +
                `IT may be able to recover your files from backups.`
        },
        // 7. SUSPICIOUS LINKS
        {
            id: 'suspicious_links',
            keywords: ['suspicious link', 'clicked link', 'strange url', 'unknown website', 'redirect', 'shortened link', 'bit.ly', 'clicked on'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Suspicious Link Investigation**\n\n` +
                `**Analysis Steps:**\n` +
                `1. Extract full URL (expand shorteners safely)\n` +
                `2. Check against threat intel (VirusTotal, URLVoid)\n` +
                `3. Analyze in sandbox environment\n` +
                `4. Review DNS/WHOIS registration\n\n` +
                `**If Clicked:**\n` +
                `• Capture browser history and cache\n` +
                `• Run endpoint scan for downloads\n` +
                `• Check for credential harvesting pages\n` +
                `• Force password reset if login page detected`
                : `**Clicked a Suspicious Link?**\n\n` +
                `**Immediate Steps:**\n` +
                `1. Close the browser tab\n` +
                `2. Run your antivirus scan\n` +
                `3. Change passwords for any accounts you've logged into\n` +
                `4. Report the incident to IT\n\n` +
                `**For Future:**\n` +
                `• Hover over links to see the real URL\n` +
                `• Don't trust shortened links from unknown sources\n` +
                `• When in doubt, navigate directly to the website`
        },
        // 8. PUBLIC WIFI SECURITY
        {
            id: 'public_wifi',
            keywords: ['public wifi', 'free wifi', 'coffee shop', 'hotel wifi', 'airport wifi', 'open network', 'unsecured network', 'wifi security'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Public WiFi Security Policy**\n\n` +
                `**Enterprise Controls:**\n` +
                `• Enforce always-on VPN for remote workers\n` +
                `• Deploy certificate-based authentication\n` +
                `• Enable network access control\n` +
                `• Configure firewall for public network profile\n\n` +
                `**Monitoring:**\n` +
                `• Alert on connections from known risky networks\n` +
                `• Track VPN usage compliance`
                : `**Staying Safe on Public WiFi**\n\n` +
                `**Risks:**\n` +
                `• Attackers can intercept your data\n` +
                `• Fake "Free WiFi" networks (Evil Twin attacks)\n` +
                `• Session hijacking\n\n` +
                `**Protection:**\n` +
                `* Use the university VPN for all connections\n` +
                `* Only visit HTTPS websites\n` +
                `* Disable auto-connect to WiFi networks\n` +
                `* Turn off WiFi when not in use\n\n` +
                `* Never access banking or sensitive accounts on public WiFi`
        },
        // 9. LOST/STOLEN DEVICE
        {
            id: 'lost_device',
            keywords: ['lost device', 'stolen laptop', 'lost phone', 'missing device', 'stolen phone', 'lost computer', 'device missing', 'can\'t find'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Lost/Stolen Device Response Protocol**\n\n` +
                `**Immediate Actions:**\n` +
                `1. Attempt remote locate/wipe via MDM\n` +
                `2. Disable device certificates and tokens\n` +
                `3. Reset all credentials associated with device\n` +
                `4. Revoke VPN and email access\n` +
                `5. Report to law enforcement if stolen\n\n` +
                `**Data Assessment:**\n` +
                `• Was disk encryption enabled?\n` +
                `• What data was accessible?\n` +
                `• Determine breach notification requirements`
                : `**Lost or Stolen Device - Act Fast!**\n\n` +
                `**Immediately:**\n` +
                `1. Report to IT Security: Extension 5555\n` +
                `2. Change your university password\n` +
                `3. Change passwords for any accounts on the device\n` +
                `4. If personal device: Use Find My iPhone/Android\n` +
                `5. If stolen: File a police report\n\n` +
                `**IT Can Help:**\n` +
                `• Remotely wipe university data\n` +
                `• Revoke access to university systems`
        },
        // 10. DATA LEAK / SENSITIVE INFORMATION
        {
            id: 'data_leak',
            keywords: ['data leak', 'data breach', 'sensitive information', 'exposed data', 'personal information', 'pii', 'confidential', 'accidentally sent', 'wrong recipient'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Data Leak/Breach Response**\n\n` +
                `**Classification:**\n` +
                `• Determine data types involved (PII, PHI, financial)\n` +
                `• Estimate number of affected individuals\n` +
                `• Identify exposure duration\n\n` +
                `**Containment:**\n` +
                `1. Remove exposed data from public access\n` +
                `2. Preserve evidence for investigation\n` +
                `3. Document all remediation actions\n\n` +
                `**Compliance:**\n` +
                `• Assess regulatory notification requirements\n` +
                `• Prepare breach notification if required\n` +
                `• Engage legal counsel`
                : `**Data Exposure - What To Do**\n\n` +
                `**If You Accidentally Shared Sensitive Data:**\n` +
                `1. Report immediately to your supervisor\n` +
                `2. Contact IT Security\n` +
                `3. Document what was shared and with whom\n` +
                `4. Don't try to cover it up - quick reporting helps!\n\n` +
                `**Preventing Data Exposure:**\n` +
                `• Double-check recipients before sending\n` +
                `• Use encryption for sensitive files\n` +
                `• Don't store sensitive data on personal devices`
        },
        // 11. TWO-FACTOR AUTHENTICATION
        {
            id: 'two_factor',
            keywords: ['two factor', '2fa', 'mfa', 'multi-factor', 'authenticator', 'verification code', 'otp', 'one-time password', 'authentication app'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**MFA Implementation Guidelines**\n\n` +
                `**Recommended Methods (Priority Order):**\n` +
                `1. FIDO2/WebAuthn hardware keys\n` +
                `2. Authenticator apps (TOTP)\n` +
                `3. Push notifications\n` +
                `4. SMS (least secure, last resort)\n\n` +
                `**Rollout Best Practices:**\n` +
                `• Phase deployment by user group\n` +
                `• Require backup codes enrollment\n` +
                `• Monitor for MFA fatigue attacks\n` +
                `• Implement number matching for push notifications`
                : `**Two-Factor Authentication (2FA)**\n\n` +
                `2FA adds a second layer of security beyond your password.\n\n` +
                `**How to Set Up:**\n` +
                `1. Go to your account security settings\n` +
                `2. Select "Enable Two-Factor Authentication"\n` +
                `3. Use an authenticator app (Microsoft/Google Authenticator)\n` +
                `4. Save your backup codes securely\n\n` +
                `**Benefits:**\n` +
                `* Even if someone gets your password, they can't log in\n` +
                `* You're notified of unauthorized login attempts`
        },
        // 12. SUSPICIOUS LOGIN
        {
            id: 'suspicious_login',
            keywords: ['suspicious login', 'unknown login', 'login from', 'didn\'t log in', 'someone logged in', 'unfamiliar location', 'login alert', 'access from'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Suspicious Login Investigation**\n\n` +
                `**Analysis Steps:**\n` +
                `1. Review authentication logs for the account\n` +
                `2. Correlate IP/geolocation with user's normal patterns\n` +
                `3. Check for impossible travel scenarios\n` +
                `4. Review device fingerprint/user agent\n\n` +
                `**If Confirmed Unauthorized:**\n` +
                `• Terminate all active sessions\n` +
                `• Force credential reset\n` +
                `• Enable heightened monitoring\n` +
                `• Check for mailbox rules or account changes`
                : `**Suspicious Login Alert?**\n\n` +
                `**If You Didn't Log In:**\n` +
                `1. Change your password immediately\n` +
                `2. Enable 2FA if not already active\n` +
                `3. Check for unfamiliar devices in your account\n` +
                `4. Report to IT Security\n\n` +
                `**If It Was You:**\n` +
                `• Verify location matches where you were\n` +
                `• VPN usage can show different locations\n` +
                `• Mobile data vs WiFi may show different IPs`
        },
        // 13. EMAIL SPOOFING
        {
            id: 'email_spoofing',
            keywords: ['email spoofing', 'fake sender', 'pretending email', 'forged email', 'impersonating email', 'from boss', 'ceo fraud', 'bec'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Email Spoofing/BEC Response**\n\n` +
                `**Technical Verification:**\n` +
                `• Check email headers (SPF, DKIM, DMARC)\n` +
                `• Analyze Reply-To vs From address\n` +
                `• Review sending IP against domain records\n\n` +
                `**If BEC Attempt:**\n` +
                `• Alert finance department immediately\n` +
                `• If funds transferred: Contact bank within 24hrs\n` +
                `• Preserve all evidence for law enforcement\n` +
                `• Report to IC3.gov`
                : `**Email Spoofing - Fake Sender Emails**\n\n` +
                `Attackers can make emails appear to come from trusted people.\n\n` +
                `**Warning Signs:**\n` +
                `• Unusual requests for money or gift cards\n` +
                `• CEO/boss asking you to bypass procedures\n` +
                `• Pressure to keep request confidential\n` +
                `• Email address slightly different than normal\n\n` +
                `**Always:**\n` +
                `* Verify unusual requests by phone or in person\n` +
                `* Check the actual email address, not just display name\n` +
                `* Report suspicious emails to IT`
        },
        // 14. INSIDER THREAT
        {
            id: 'insider_threat',
            keywords: ['insider threat', 'employee steal', 'internal threat', 'coworker suspicious', 'stealing data', 'disgruntled', 'termination', 'leaving employee'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Insider Threat Indicators & Response**\n\n` +
                `**Warning Signs:**\n` +
                `• Unusual data access patterns\n` +
                `• Large file downloads/transfers\n` +
                `• Access during odd hours\n` +
                `• Bypassing security controls\n` +
                `• Signs of disgruntlement\n\n` +
                `**Response:**\n` +
                `1. Coordinate with HR and Legal\n` +
                `2. Preserve evidence without alerting subject\n` +
                `3. Review access logs and DLP alerts\n` +
                `4. Prepare for access revocation if needed`
                : `**Reporting Security Concerns About Others**\n\n` +
                `If you notice concerning behavior, report it confidentially:\n\n` +
                `**Contact:**\n` +
                `• IT Security: security@veritas.edu\n` +
                `• HR: hr@veritas.edu\n` +
                `• Anonymous hotline: 1-800-XXX-XXXX\n\n` +
                `**What to Report:**\n` +
                `• Unusual access to sensitive areas or data\n` +
                `• Attempts to bypass security procedures\n` +
                `• Sharing credentials or access cards\n\n` +
                `Your identity will be protected.`
        },
        // 15. BACKUP & RECOVERY
        {
            id: 'backup',
            keywords: ['backup', 'restore', 'recovery', 'lost files', 'deleted files', 'recover data', 'backup data', 'save files'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Backup & Recovery Management**\n\n` +
                `**Backup Strategy (3-2-1 Rule):**\n` +
                `• 3 copies of data\n` +
                `• 2 different storage types\n` +
                `• 1 offsite/air-gapped copy\n\n` +
                `**Recovery Testing:**\n` +
                `• Monthly restore tests\n` +
                `• Document RTO/RPO for critical systems\n` +
                `• Maintain offline recovery documentation\n` +
                `• Test full disaster recovery annually`
                : `**Protecting Your Data with Backups**\n\n` +
                `**University Resources:**\n` +
                `• OneDrive: Automatically backs up Desktop & Documents\n` +
                `• Network drives: Backed up nightly\n` +
                `• Request restore: Contact IT Help Desk\n\n` +
                `**Best Practices:**\n` +
                `* Save important files to OneDrive or network drives\n` +
                `* Don't rely solely on local storage\n` +
                `* Version history protects against accidental changes`
        },
        // 16. IDENTITY THEFT
        {
            id: 'identity_theft',
            keywords: ['identity theft', 'identity stolen', 'someone pretending to be me', 'fraud', 'credit', 'ssn', 'social security'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Identity Theft Response (Staff Member)**\n\n` +
                `**If Student/Staff Affected:**\n` +
                `1. Document all reported instances\n` +
                `2. Check for unauthorized system access\n` +
                `3. Coordinate with relevant departments\n` +
                `4. Assist with account recovery\n\n` +
                `**Resources:**\n` +
                `• IdentityTheft.gov for reporting\n` +
                `• Credit freeze guidance`
                : `**Identity Theft - Immediate Steps**\n\n` +
                `**If Your Identity Is Stolen:**\n` +
                `1. Place a fraud alert on your credit reports\n` +
                `2. Report to IdentityTheft.gov\n` +
                `3. File a police report\n` +
                `4. Close fraudulent accounts\n` +
                `5. Change passwords for ALL accounts\n\n` +
                `**University Specific:**\n` +
                `• Report to IT Security for account protection\n` +
                `• Contact financial aid if student records affected`
        },
        // 17. BROWSER SECURITY
        {
            id: 'browser_security',
            keywords: ['browser', 'extension', 'plugin', 'popup', 'certificate', 'not secure', 'https', 'browser hijack'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Browser Security Standards**\n\n` +
                `**Enterprise Policy:**\n` +
                `• Approve extensions via managed browser\n` +
                `• Block known malicious extensions\n` +
                `• Enforce HTTPS-only mode\n` +
                `• Deploy certificate transparency\n\n` +
                `**Monitoring:**\n` +
                `• Log extension installations\n` +
                `• Alert on unauthorized plugins`
                : `**Browser Security Tips**\n\n` +
                `**Keep Your Browser Safe:**\n` +
                `* Keep browser updated\n` +
                `* Only install extensions from official stores\n` +
                `* Look for HTTPS (padlock icon) on sensitive sites\n` +
                `* Clear cookies and cache regularly\n\n` +
                `**Warning Signs:**\n` +
                `• Homepage changed unexpectedly\n` +
                `• New toolbars you didn't install\n` +
                `• Lots of popup ads\n\n` +
                `Contact IT if your browser behaves strangely.`
        },
        // 18. SECURE FILE SHARING
        {
            id: 'file_sharing',
            keywords: ['file sharing', 'share files', 'send files', 'secure transfer', 'large file', 'dropbox', 'google drive', 'onedrive'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Secure File Sharing Policy**\n\n` +
                `**Approved Methods:**\n` +
                `• University OneDrive/SharePoint\n` +
                `• Approved secure file transfer (SFTP)\n` +
                `• Encrypted email for small files\n\n` +
                `**Prohibited:**\n` +
                `• Personal cloud storage for university data\n` +
                `• USB drives for sensitive data\n` +
                `• Unencrypted FTP\n\n` +
                `**DLP Integration:**\n` +
                `• Classify documents before sharing\n` +
                `• Apply expiration to shared links`
                : `**Sharing Files Securely**\n\n` +
                `**Use University Tools:**\n` +
                `• OneDrive: Best for internal sharing\n` +
                `• SharePoint: For team collaboration\n` +
                `• Encrypt sensitive documents\n\n` +
                `**Don't:**\n` +
                `* Email sensitive files unencrypted\n` +
                `* Use personal Dropbox/Google Drive for work\n` +
                `* Share links publicly unless necessary\n\n` +
                `Set expiration dates on shared links!`
        },
        // 19. SAFE WEB BROWSING
        {
            id: 'safe_browsing',
            keywords: ['safe browsing', 'dangerous website', 'blocked site', 'download file', 'is this safe', 'trusted website', 'legitimate'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Web Filtering & Safe Browsing**\n\n` +
                `**Controls:**\n` +
                `• DNS filtering for malicious domains\n` +
                `• Category-based web filtering\n` +
                `• SSL inspection for encrypted threats\n` +
                `• Sandboxing for unknown downloads\n\n` +
                `**Response to Block Bypasses:**\n` +
                `• Investigate circumvention attempts\n` +
                `• Legitimate exceptions via request form`
                : `**Safe Web Browsing Tips**\n\n` +
                `**Before Downloading:**\n` +
                `• Only download from official sources\n` +
                `• Check file extension (beware .exe from emails)\n` +
                `• Scan downloads with antivirus\n\n` +
                `**Identifying Safe Sites:**\n` +
                `* HTTPS padlock icon\n` +
                `* Correct spelling of domain\n` +
                `* No excessive popups\n` +
                `* Privacy policy available\n\n` +
                `When in doubt, don't click!`
        },
        // 20. VPN USAGE
        {
            id: 'vpn',
            keywords: ['vpn', 'remote access', 'work from home', 'connect remotely', 'virtual private network', 'tunnel'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**VPN Security Configuration**\n\n` +
                `**Best Practices:**\n` +
                `• Split tunnel only for trusted traffic\n` +
                `• Enforce MFA for VPN authentication\n` +
                `• Monitor for anomalous connection patterns\n` +
                `• Set session timeouts\n` +
                `• Log all VPN connections\n\n` +
                `**Compliance:**\n` +
                `• Ensure endpoint compliance before connection\n` +
                `• Require updated antivirus`
                : `**Using the University VPN**\n\n` +
                `**When to Use VPN:**\n` +
                `• Accessing university resources remotely\n` +
                `• Working from public WiFi\n` +
                `• Accessing sensitive systems from home\n\n` +
                `**How to Connect:**\n` +
                `1. Download VPN client from IT portal\n` +
                `2. Enter your university credentials\n` +
                `3. Complete 2FA verification\n` +
                `4. You're connected!\n\n` +
                `Contact IT Help Desk for VPN setup assistance.`
        },
        // 21. SOFTWARE UPDATES
        {
            id: 'updates',
            keywords: ['update', 'patch', 'outdated', 'vulnerable', 'software update', 'windows update', 'upgrade'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Patch Management Protocol**\n\n` +
                `**Critical Patches:**\n` +
                `• Deploy within 24-48 hours\n` +
                `• Test in staging before production\n` +
                `• Emergency bypass for zero-days\n\n` +
                `**Regular Patching:**\n` +
                `• Monthly patch cycles\n` +
                `• Compliance reporting\n` +
                `• Exception tracking for legacy systems`
                : `**Keeping Software Updated**\n\n` +
                `Updates fix security vulnerabilities!\n\n` +
                `**Best Practices:**\n` +
                `* Enable automatic updates\n` +
                `* Restart when updates require it\n` +
                `* Update all software, not just Windows\n` +
                `* Update mobile apps too\n\n` +
                `**University Computers:**\n` +
                `Updates are managed automatically. Please don't postpone restarts for more than a day.`
        },
        // 22. PHYSICAL SECURITY
        {
            id: 'physical_security',
            keywords: ['physical security', 'tailgating', 'badge', 'locked door', 'stranger', 'unauthorized person', 'secure area'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Physical Security Protocol**\n\n` +
                `**Access Control:**\n` +
                `• Badge-based entry with audit logging\n` +
                `• Visitor management system\n` +
                `• CCTV coverage of entry points\n\n` +
                `**Incident Response:**\n` +
                `• Badge loss: Immediate deactivation\n` +
                `• Tailgating: Report and review footage\n` +
                `• Suspicious persons: Contact campus security`
                : `**Physical Security Reminders**\n\n` +
                `**Protect Your Workspace:**\n` +
                `* Always badge in - don't hold doors for strangers\n` +
                `* Lock your computer when stepping away\n` +
                `* Secure sensitive documents in drawers\n` +
                `* Report lost badges immediately\n\n` +
                `**See Something Suspicious?**\n` +
                `Contact Campus Security: 555-SAFE`
        },
        // 23. REPORTING INCIDENTS
        {
            id: 'incident_reporting',
            keywords: ['report incident', 'how to report', 'where to report', 'security incident', 'submit report', 'notify security', 'escalate'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Incident Reporting & Escalation**\n\n` +
                `**Severity Classification:**\n` +
                `• Critical: Active ongoing attack\n` +
                `• High: Confirmed compromise\n` +
                `• Medium: Suspicious activity\n` +
                `• Low: Policy violation\n\n` +
                `**Escalation Matrix:**\n` +
                `• Critical: CISO + IT Director immediately\n` +
                `• High: Security lead within 1 hour\n` +
                `• Medium/Low: Normal ticket queue`
                : `**How to Report Security Incidents**\n\n` +
                `**Use the Submit Report Feature:**\n` +
                `1. Click "Submit Report" in the navigation\n` +
                `2. Select the incident type\n` +
                `3. Describe what happened\n` +
                `4. Attach any screenshots or evidence\n` +
                `5. Submit!\n\n` +
                `**For Emergencies:**\n` +
                `Call IT Security immediately: Extension 5555\n\n` +
                `Reports can be anonymous if you prefer.`
        },
        // 24. SECURITY AWARENESS
        {
            id: 'security_awareness',
            keywords: ['security training', 'awareness', 'best practices', 'tips', 'how to stay safe', 'security basics', 'learn security'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Security Awareness Program**\n\n` +
                `**Training Components:**\n` +
                `• Annual mandatory training\n` +
                `• Phishing simulations\n` +
                `• Role-based specialized training\n` +
                `• New hire security onboarding\n\n` +
                `**Metrics:**\n` +
                `• Track phishing click rates\n` +
                `• Measure reporting rates\n` +
                `• Compliance tracking`
                : `**Security Awareness Resources**\n\n` +
                `**Quick Tips:**\n` +
                `* Use strong, unique passwords\n` +
                `* Enable two-factor authentication\n` +
                `* Be suspicious of unexpected emails\n` +
                `* Keep devices updated\n` +
                `* Back up important files\n\n` +
                `**Training:**\n` +
                `Complete your annual security training in the Learning Portal.`
        },
        // 25. MOBILE DEVICE SECURITY
        {
            id: 'mobile_security',
            keywords: ['mobile', 'phone security', 'smartphone', 'tablet', 'byod', 'personal device', 'mobile app'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Mobile Device Management (MDM)**\n\n` +
                `**BYOD Policy:**\n` +
                `• Container-based data separation\n` +
                `• Remote wipe capability required\n` +
                `• Minimum OS version requirements\n` +
                `• App whitelisting for work data access\n\n` +
                `**Security Enforcement:**\n` +
                `• PIN/biometric lock required\n` +
                `• Encryption mandatory\n` +
                `• Jailbroken devices blocked`
                : `**Mobile Device Security**\n\n` +
                `**Protect Your Phone:**\n` +
                `* Use PIN, fingerprint, or face unlock\n` +
                `* Keep your phone OS updated\n` +
                `* Only install apps from official stores\n` +
                `* Enable Find My Device feature\n` +
                `* Be careful with app permissions\n\n` +
                `**University Email on Phone:**\n` +
                `Use the Outlook app with your university credentials.`
        },
        // 26. ENCRYPTION
        {
            id: 'encryption',
            keywords: ['encryption', 'encrypt', 'encrypted', 'decrypt', 'sensitive data', 'protect files', 'bitlocker', 'secure storage'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Encryption Standards**\n\n` +
                `**At Rest:**\n` +
                `• Full disk encryption (BitLocker/FileVault)\n` +
                `• Database encryption for sensitive data\n` +
                `• Key management via HSM\n\n` +
                `**In Transit:**\n` +
                `• TLS 1.2+ for all connections\n` +
                `• Certificate management\n` +
                `• Disable legacy protocols`
                : `**Understanding Encryption**\n\n` +
                `Encryption scrambles data so only authorized people can read it.\n\n` +
                `**University Computers:**\n` +
                `* BitLocker is enabled automatically\n` +
                `* Your files are protected if laptop is lost\n\n` +
                `**Protecting Sensitive Files:**\n` +
                `• Use OneDrive (encrypted by default)\n` +
                `• Password-protect sensitive documents\n` +
                `• Use encrypted email for confidential info`
        },
        // 27. ACCOUNT LOCKOUT
        {
            id: 'account_lockout',
            keywords: ['locked out', 'can\'t login', 'account locked', 'too many attempts', 'forgot password', 'reset password', 'unlock account'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Account Lockout Management**\n\n` +
                `**Lockout Policy:**\n` +
                `• 5 failed attempts = 15 minute lockout\n` +
                `• Auto-unlock after timeout\n` +
                `• Admin can manually unlock\n\n` +
                `**Before Unlocking:**\n` +
                `• Verify user identity\n` +
                `• Check for brute force attack patterns\n` +
                `• Review source IPs of failed attempts`
                : `**Account Locked Out?**\n\n` +
                `**Self-Service Reset:**\n` +
                `1. Go to password.veritas.edu\n` +
                `2. Click "Forgot Password"\n` +
                `3. Verify with your recovery email/phone\n` +
                `4. Create a new password\n\n` +
                `**Still Locked Out?**\n` +
                `Contact IT Help Desk with your student/staff ID.\n\n` +
                `Note: Accounts auto-unlock after 15 minutes.`
        },
        // 28. SECURE COMMUNICATION
        {
            id: 'secure_communication',
            keywords: ['secure communication', 'private message', 'encrypted chat', 'confidential communication', 'teams', 'zoom', 'meeting security'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Secure Communication Guidelines**\n\n` +
                `**Approved Platforms:**\n` +
                `• Microsoft Teams (with DLP)\n` +
                `• Encrypted email (sensitivity labels)\n` +
                `• Zoom with waiting rooms\n\n` +
                `**Meeting Security:**\n` +
                `• Enable waiting rooms\n` +
                `• Use meeting passwords\n` +
                `• Lock meetings after start\n` +
                `• Control screen sharing permissions`
                : `**Communicating Securely**\n\n` +
                `**For Sensitive Discussions:**\n` +
                `* Use Microsoft Teams or university email\n` +
                `* Mark emails as "Confidential" when needed\n` +
                `* Don't discuss sensitive info on personal apps\n\n` +
                `**Video Meetings:**\n` +
                `• Use meeting passwords\n` +
                `• Don't share meeting links publicly\n` +
                `• Be aware of your background`
        },
        // 29. USB DEVICE SECURITY
        {
            id: 'usb_security',
            keywords: ['usb', 'flash drive', 'thumb drive', 'external drive', 'found usb', 'unknown usb', 'usb stick'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**USB Device Security Policy**\n\n` +
                `**Controls:**\n` +
                `• Device control software deployed\n` +
                `• Only encrypted USB drives approved\n` +
                `• Auto-scan on connection\n` +
                `• Block unregistered devices\n\n` +
                `**Found USB Protocol:**\n` +
                `• Treat as potentially malicious\n` +
                `• Analyze in isolated sandbox\n` +
                `• Never plug into production systems`
                : `**USB Drive Safety**\n\n` +
                `**Found a USB Drive?**\n` +
                `Note: NEVER plug in unknown USB drives!\n` +
                `They may contain malware that runs automatically.\n\n` +
                `**Turn it in to IT Security.**\n\n` +
                `**Using USB Drives:**\n` +
                `• Only use university-approved drives\n` +
                `• Scan drives before opening files\n` +
                `• Don't store sensitive data on USB\n` +
                `• Use cloud storage instead when possible`
        },
        // 30. REMOTE WORK SECURITY
        {
            id: 'remote_work',
            keywords: ['remote work', 'work from home', 'wfh', 'home office', 'remote security', 'working remotely', 'hybrid work'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Remote Work Security Framework**\n\n` +
                `**Technical Controls:**\n` +
                `• Always-on VPN enforcement\n` +
                `• Endpoint detection and response (EDR)\n` +
                `• Cloud access security broker (CASB)\n` +
                `• Zero-trust network access\n\n` +
                `**Policy:**\n` +
                `• Home network security requirements\n` +
                `• Physical privacy guidelines\n` +
                `• Approved device requirements`
                : `**Secure Remote Work**\n\n` +
                `**Home Office Security:**\n` +
                `* Use the VPN when accessing university systems\n` +
                `* Secure your home WiFi with a strong password\n` +
                `* Lock your screen when away\n` +
                `* Don't let family use work devices\n` +
                `* Protect sensitive documents from view\n\n` +
                `**Video Calls:**\n` +
                `Be mindful of what's visible in your background!`
        },
        // 31. ZERO-DAY THREATS
        {
            id: 'zero_day',
            keywords: ['zero day', 'zero-day', 'new vulnerability', 'unpatched', 'emerging threat', 'latest attack'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Zero-Day Response Protocol**\n\n` +
                `**Upon Discovery:**\n` +
                `1. Assess exposure in environment\n` +
                `2. Implement temporary mitigations\n` +
                `3. Monitor for exploitation attempts\n` +
                `4. Track vendor patch availability\n\n` +
                `**Communication:**\n` +
                `• Alert SOC and IT leadership\n` +
                `• Prepare user communication if needed\n` +
                `• Document decisions and timeline`
                : `**New Security Threats**\n\n` +
                `Zero-day attacks exploit unknown vulnerabilities.\n\n` +
                `**How IT Protects You:**\n` +
                `• 24/7 threat monitoring\n` +
                `• Rapid patch deployment\n` +
                `• Network-level protection\n\n` +
                `**What You Can Do:**\n` +
                `* Keep your software updated\n` +
                `* Report anything unusual immediately\n` +
                `* Follow security alerts from IT`
        },
        // 32. SOCIAL MEDIA SECURITY
        {
            id: 'social_media',
            keywords: ['social media', 'facebook', 'twitter', 'linkedin', 'instagram', 'posting', 'oversharing', 'privacy settings'],
            getResponse: (role, isPrivileged) => isPrivileged
                ? `**Social Media Security Policy**\n\n` +
                `**Organizational Accounts:**\n` +
                `• MFA required for all official accounts\n` +
                `• Shared credential management via vault\n` +
                `• Approval process for posting\n\n` +
                `**Employee Guidelines:**\n` +
                `• Don't post internal information\n` +
                `• Avoid location tagging at work\n` +
                `• Watch for social engineering via DMs`
                : `**Social Media Safety**\n\n` +
                `**Privacy Settings:**\n` +
                `* Review who can see your posts\n` +
                `* Limit personal info in bios\n` +
                `* Be careful with location sharing\n\n` +
                `**Security Tips:**\n` +
                `• Don't post work-related info\n` +
                `• Beware of friend requests from strangers\n` +
                `• Use unique passwords for each platform\n` +
                `• Enable 2FA on all social accounts`
        },
    ];

    // --- MAIN ANSWER METHOD ---
    async answer(userId: string, role: UserRole, query: string) {
        const lowerQuery = query.toLowerCase();
        const isPrivileged = role === 'ADMIN' || role === 'SECURITY';
        let answer = '';
        let matchedTopic: SecurityTopic | null = null;

        // --- SEMANTIC INTENT MATCHING ---
        // Score each topic based on keyword matches
        let bestScore = 0;
        for (const topic of this.securityTopics) {
            const score = this.calculateMatchScore(lowerQuery, topic.keywords);
            if (score > bestScore) {
                bestScore = score;
                matchedTopic = topic;
            }
        }

        // --- DATA QUERIES (Stats, Summary, Search) ---
        const isStats = this.checkKeywords(lowerQuery, ['how many', 'stats', 'count', 'numbers', 'statistics', 'total']);
        const isSummary = this.checkKeywords(lowerQuery, ['summarize', 'summary', 'latest', 'recent', 'overview', 'show me', 'my reports', 'list reports']);

        if (isStats) {
            answer = await this.handleStatsQuery(userId, role, isPrivileged);
        } else if (isSummary) {
            answer = await this.handleSummaryQuery(userId, role, isPrivileged, lowerQuery);
        } else if (matchedTopic && bestScore >= 1) {
            // Topic matched with sufficient confidence
            answer = matchedTopic.getResponse(role, isPrivileged);
        } else {
            // No strong match - provide intelligent general response  
            answer = this.getIntelligentFallback(query, role, isPrivileged);
        }

        // Persist chat history
        await this.prisma.chatMessage.create({
            data: {
                userId,
                role,
                query,
                response: answer,
            },
        });

        // Audit log
        await this.audit.log(userId, 'CHATBOT_QUERY', `Query: ${query.substring(0, 50)}`);

        return answer;
    }

    // --- HELPER METHODS ---

    private calculateMatchScore(query: string, keywords: string[]): number {
        let matches = 0;

        for (const keyword of keywords) {
            const weight = keyword.length > 4 ? 2 : 1; // Longer keywords weighted more
            if (query.includes(keyword)) {
                matches += weight;
            }
        }

        return matches;
    }

    private checkKeywords(query: string, keywords: string[]): boolean {
        return keywords.some(k => query.includes(k));
    }

    private async handleStatsQuery(userId: string, role: UserRole, isPrivileged: boolean): Promise<string> {
        if (isPrivileged) {
            // Admin/Security see all stats
            const count = await this.prisma.report.count();
            const openCount = await this.prisma.report.count({ where: { status: 'OPEN' } });
            const resolvedCount = await this.prisma.report.count({ where: { status: 'RESOLVED' } });
            const criticalCount = await this.prisma.report.count({ where: { priority: 'CRITICAL' } });

            return `**Platform-Wide Statistics**\n\n` +
                `**Total Reports**: ${count}\n` +
                `**Open Issues**: ${openCount}\n` +
                `**Resolved**: ${resolvedCount}\n` +
                `**Critical Priority**: ${criticalCount}`;
        } else {
            // Staff/Student see only their own stats
            const myCount = await this.prisma.report.count({ where: { authorId: userId } });
            const myOpen = await this.prisma.report.count({ where: { authorId: userId, status: 'OPEN' } });
            const myResolved = await this.prisma.report.count({ where: { authorId: userId, status: 'RESOLVED' } });

            return `**Your Report Statistics**\n\n` +
                `**Your Total Reports**: ${myCount}\n` +
                `**Open**: ${myOpen}\n` +
                `**Resolved**: ${myResolved}\n\n` +
                `_Based on reports you have submitted._`;
        }
    }

    private async handleSummaryQuery(userId: string, role: UserRole, isPrivileged: boolean, query: string): Promise<string> {
        const take = 5;

        if (isPrivileged) {
            // Admin/Security see all reports
            const reports = await this.prisma.report.findMany({
                take,
                orderBy: { createdAt: 'desc' },
                include: { author: true }
            });

            if (reports.length === 0) {
                return "No reports found in the system.";
            }

            let answer = `**Latest Threat Reports (System-Wide)**\n\n`;
            reports.forEach(r => {
                answer += `• [${r.priority}] **${r.title}** (${r.status})\n`;
                answer += `  _Author: ${r.isAnonymous ? 'Anonymous' : (r.author?.email || 'Unknown')}_\n\n`;
            });
            answer += `*Showing last ${take} reports.*`;
            return answer;
        } else {
            // Staff/Student see only their own reports
            const reports = await this.prisma.report.findMany({
                where: { authorId: userId },
                take,
                orderBy: { createdAt: 'desc' },
            });

            if (reports.length === 0) {
                return `**Your Reports**\n\nYou haven't submitted any reports yet.\n\nUse the **Submit Report** page to report security incidents.`;
            }

            let answer = `**Your Recent Reports**\n\n`;
            reports.forEach(r => {
                answer += `• [${r.priority}] **${r.title}** (${r.status})\n`;
            });
            answer += `\n_Based on reports you submitted._`;
            return answer;
        }
    }

    private getIntelligentFallback(originalQuery: string, role: UserRole, isPrivileged: boolean): string {
        // Analyze query for context clues
        const query = originalQuery.toLowerCase();

        // Check for question words to provide contextual help
        const isQuestion = query.includes('?') ||
            query.startsWith('how') ||
            query.startsWith('what') ||
            query.startsWith('why') ||
            query.startsWith('when') ||
            query.startsWith('where') ||
            query.startsWith('can') ||
            query.startsWith('should');

        // Check for action intent
        const wantsToReport = this.checkKeywords(query, ['report', 'submit', 'notify', 'tell']);
        const needsHelp = this.checkKeywords(query, ['help', 'assist', 'support', 'confused', 'don\'t know']);
        const askingAboutPlatform = this.checkKeywords(query, ['this platform', 'v-ctrip', 'this system', 'how does']);

        if (askingAboutPlatform) {
            return `**About V-CTRIP**\n\n` +
                `The Veritas Cyber Threat Reporting & Intelligence Platform helps you:\n\n` +
                `• **Report** security incidents and suspicious activity\n` +
                `• **Track** the status of your reports\n` +
                `• **Learn** about security best practices\n` +
                `• **Stay informed** about campus security alerts\n\n` +
                `How can I help you today?`;
        }

        if (wantsToReport) {
            return `**Ready to Report an Incident?**\n\n` +
                `Use the **Submit Report** page in the navigation to:\n` +
                `• Describe the security incident\n` +
                `• Select the type and priority\n` +
                `• Attach evidence if available\n` +
                `• Submit anonymously if preferred\n\n` +
                `Would you like guidance on a specific type of incident?`;
        }

        if (needsHelp) {
            return `**I'm Here to Help!**\n\n` +
                `I can assist you with:\n\n` +
                `**Security Questions:**\n` +
                `• "What should I do if I clicked a suspicious link?"\n` +
                `• "How do I protect myself from phishing?"\n` +
                `• "I think my account was hacked"\n\n` +
                `**Platform Questions:**\n` +
                `• "How do I submit a report?"\n` +
                `• "Show me my reports"\n` +
                `• "How many reports are there?"\n\n` +
                `Just ask in your own words!`;
        }

        // General intelligent response
        return `**I understand you're asking about: "${originalQuery}"**\n\n` +
            `I can help with many security topics including:\n\n` +
            `* Account security & passwords\n` +
            `* Phishing & email scams\n` +
            `* Malware & ransomware\n` +
            `* Mobile & device security\n` +
            `* Remote work security\n` +
            `* Incident reporting\n\n` +
            `Could you tell me more about what you need help with?`;
    }
}
