import json

# Read existing books.js data
with open('src/data/books.js', 'r') as f:
    content = f.read()

# We can append the new book dynamically
new_book = """  ,{
    id: 'role-of-ict-in-accounting',
    title: 'Role of ICT in Accounting',
    author: 'Mohammad Ali Yusuf Hossain',
    cover: '#1e3a8a',
    pages: [
      'Information and Communication Technology (ICT) plays a crucial role in modern accounting by transforming how financial information is collected, processed, stored, and communicated. ICT tools streamline tasks, improve accuracy, and provide real-time access to financial data[cite: 15].',
      'Key Contributions of ICT in Accounting:\\n1. Automation of Accounting Processes: Automated repetitive tasks like data entry, payroll, invoicing, and bank reconciliations using tools like QuickBooks, Xero, Sage, and Tally[cite: 15].\\n2. Real-Time Data Access: Cloud-based systems allow businesses to access financial information from anywhere, in real time[cite: 15].',
      '3. Improved Accuracy and Reduced Errors: Systems validate data entries, detect inconsistencies, and enforce double-entry rules (debit = credit) automatically[cite: 15].\\n4. Financial Reporting and Analysis: Generates balance sheets, income statements, and cash flow statements with a few clicks, backed by data analytics and business intelligence tools[cite: 15, 16].',
      '5. Enhanced Data Security: Advanced encryption, digital backups, restricted access controls, and data recovery options ensure confidentiality and integrity[cite: 16].\\n6. Compliance and Taxation: Simplifies tax management, integrates with government platforms, and maintains audit trails for every transaction[cite: 16].',
      '7. Collaboration and Communication: Enables remote teams to work together on financial records using cloud platforms and shared tools[cite: 16].\\n8. Cost Savings and Efficiency: Reduces physical storage, paper waste, and in-house server costs[cite: 16, 17].',
      '9. Inventory and Asset Management: Links accounting systems with inventory software to track stock levels, depreciation, and acquisitions in real time[cite: 17].\\n10. Globalization and Scalability: Easily handles multi-currency transactions, international tax regulations, and consolidated reporting across multiple regions[cite: 17].',
      'Examples of ICT Tools Used in Accounting:\\n1. Accounting Software: QuickBooks, Xero, Sage, Tally, FreshBooks[cite: 17].\\n2. ERP Systems: SAP, Oracle, Microsoft Dynamics[cite: 17].\\n3. Cloud Computing: Zoho Books, NetSuite[cite: 17].\\n4. Spreadsheets: Microsoft Excel, Google Sheets[cite: 17].\\n5. Tax Management & BI Tools: TurboTax, Tableau, Power BI[cite: 18].',
      'Benefits & Challenges:\\nBenefits include faster transaction processing, absolute precision, cost reduction, and data-driven decision making[cite: 18]. Challenges include cybersecurity risks, high initial technology setup costs, internet dependence, and the need for continuous staff training[cite: 18, 19].\\n\\nConclusion: ICT has revolutionized accounting, making it an indispensable tool for modern business growth[cite: 19].']
  }
];
"""

# Insert before the last closing bracket
updated_content = content.strip().rstrip('];') + ',' + new_book
with open('src/data/books.js', 'w') as f:
    f.write(updated_content)

print("Successfully added PDF book to library data!")
