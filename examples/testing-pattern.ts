import 'reflect-metadata';
import { Container, createToken, singleton, transient, get, setContainer } from '../index.js';

// ============================================
// Testing Pattern Example
// ============================================

interface Logger {
  log(message: string): void;
}

interface EmailService {
  sendEmail(to: string, subject: string): void;
}

interface UserNotificationService {
  notifyUser(userId: number, message: string): void;
}

// Create tokens
const Logger = createToken<Logger>('Logger');
const EmailService = createToken<EmailService>('EmailService');
const UserNotificationService = createToken<UserNotificationService>('UserNotificationService');

// ============================================
// Production Implementations
// ============================================

@singleton()
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

@singleton()
class SmtpEmailService implements EmailService {
  private logger = get(Logger);

  sendEmail(to: string, subject: string): void {
    this.logger.log(`Sending email to ${to}: ${subject}`);
    // Actual SMTP logic here
  }
}

// ============================================
// Service with Test-Friendly Constructor
// ============================================

@transient()
class UserNotificationServiceImpl implements UserNotificationService {
  private logger: Logger;
  private emailService: EmailService;

  // Optional constructor parameters enable easy testing!
  constructor(logger?: Logger, emailService?: EmailService) {
    // Use provided dependencies OR resolve from container
    this.logger = logger ?? get(Logger);
    this.emailService = emailService ?? get(EmailService);
  }

  notifyUser(userId: number, message: string): void {
    this.logger.log(`Notifying user ${userId}: ${message}`);
    this.emailService.sendEmail(`user${userId}@example.com`, message);
  }
}

// ============================================
// Mock Implementations for Testing
// ============================================

class MockLogger implements Logger {
  logs: string[] = [];

  log(message: string): void {
    this.logs.push(message);
  }

  getLogs(): string[] {
    return this.logs;
  }
}

class MockEmailService implements EmailService {
  sentEmails: Array<{ to: string; subject: string }> = [];

  sendEmail(to: string, subject: string): void {
    this.sentEmails.push({ to, subject });
  }

  getSentEmails() {
    return this.sentEmails;
  }
}

// ============================================
// Production Usage
// ============================================

function productionExample() {
  console.log('=== Production Usage ===\n');

  const container = new Container();
  setContainer(container);

  container.register(Logger, ConsoleLogger);
  container.register(EmailService, SmtpEmailService);
  container.register(UserNotificationService, UserNotificationServiceImpl);

  const notificationService = container.resolve(UserNotificationService);
  notificationService.notifyUser(123, 'Welcome to our platform!');

  console.log('');
}

// ============================================
// Testing Usage (No Container Required!)
// ============================================

function testingExample() {
  console.log('=== Testing Usage (With Mocks) ===\n');

  // Create mocks
  const mockLogger = new MockLogger();
  const mockEmailService = new MockEmailService();

  // Instantiate directly with mocks - NO CONTAINER NEEDED!
  const notificationService = new UserNotificationServiceImpl(mockLogger, mockEmailService);

  // Use the service
  notificationService.notifyUser(456, 'Password reset requested');

  // Verify behavior using mocks
  console.log('Mock Logger captured logs:');
  mockLogger.getLogs().forEach(log => console.log(`  - ${log}`));

  console.log('\nMock Email Service sent emails:');
  mockEmailService.getSentEmails().forEach(email => {
    console.log(`  - To: ${email.to}, Subject: ${email.subject}`);
  });

  console.log('\n✓ Test passed! Service behaves correctly with mocks.');
  console.log('');
}

// ============================================
// Hybrid Usage (Container + Manual Override)
// ============================================

function hybridExample() {
  console.log('=== Hybrid Usage (Container + Manual Override) ===\n');

  const container = new Container();
  setContainer(container);

  // Register real logger
  container.register(Logger, ConsoleLogger);
  container.register(EmailService, SmtpEmailService);
  container.register(UserNotificationService, UserNotificationServiceImpl);

  // But override with a mock for email in this test
  const mockEmailService = new MockEmailService();
  const notificationService = new UserNotificationServiceImpl(undefined, mockEmailService);

  // Logger comes from container, email service is mocked
  notificationService.notifyUser(789, 'Account verified');

  console.log('\nEmails sent (from mock):');
  mockEmailService.getSentEmails().forEach(email => {
    console.log(`  - To: ${email.to}, Subject: ${email.subject}`);
  });

  console.log('');
}

// ============================================
// Run Examples
// ============================================

function main() {
  console.log('=== Testing Pattern Examples ===\n');

  productionExample();
  testingExample();
  hybridExample();

  console.log('=== All Examples Complete ===');
}

main();
