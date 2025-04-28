import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()




function problem1() {
  return prisma.$queryRaw`select firstName, lastName, income from Customer where income <= 60000 and income >= 50000 order by income desc, lastName asc, firstName asc LIMIT 10;`
}

function problem2() {
  return prisma.$queryRaw`select e.sin, b.branchName, e.salary, cast((select e2.salary from Employee e2 where b.managerSIN = e2.sin) - e.salary as char(10)) as "Salary Diff" 
  from Employee e 
    left outer join Branch b 
    on b.branchNumber = e.branchNumber 
    where b.branchName = 'London' or b.branchName = 'Berlin' 
  order by ((select e2.salary from Employee e2 where b.managerSIN = e2.sin) - e.salary) desc LIMIT 10;`
}

function problem3() {
  return prisma.$queryRaw`select firstName, lastName, income from Customer where income >= all(select (2 * income) from Customer where lastName = 'Butler') order by lastName asc, firstName asc LIMIT 10;`
}

function problem4() {
  return prisma.$queryRaw`
  select c.customerID, c.income, a.accNumber, a.branchNumber from Owns o
    left outer join Customer c
    on c.customerID = o.customerID
    left outer join Account a
    on o.accNumber = a.accNumber
    where c.income > 80000
    and 'London' in (select b.branchName 
    from Branch b 
      left outer join Account a2
      on a2.branchNumber = b.branchNumber
      left outer join Owns o2
      on o2.accNumber = a2.accNumber
      where o2.customerID = c.customerID)
    and 'Latveria' in (select b.branchName
    from Branch b 
      left outer join Account a2
      on a2.branchNumber = b.branchNumber
      left outer join Owns o2
      on o2.accNumber = a2.accNumber
      where o2.customerID = c.customerID)
  order by c.customerID asc, a.accNumber asc LIMIT 10;`
}

function problem5() {
  return prisma.$queryRaw`select o.customerID, a.type, a.accNumber,a.balance 
  from Account a 
    left outer join Owns o
    on a.accNumber = o.accNumber
    where a.type in ('SAV', 'BUS') 
  order by o.customerID asc, a.type asc, a.accNumber asc LIMIT 10;`
}

function problem6() {
  return prisma.$queryRaw`select b.branchName, a.accNumber, a.balance 
  from Account a
    left outer join Branch b
    on a.branchNumber = b.branchNumber
    where a.balance > 100000
    and ('Phillip', 'Edwards') in (select firstName, lastName from Employee e where b.managerSIN = e.sin)
    order by a.accNumber asc LIMIT 10;`
}

function problem7() {
  return prisma.$queryRaw`select c.customerID 
  from Customer c
  where 'New York' in (select b.branchName 
    from Branch b
    left outer join Account a
    on a.branchNumber = b.branchNumber
    left outer join Owns o
    on o.accNumber = a.accNumber
    where o.customerID = c.customerID)
  and 'London' not in (select b.branchName 
    from Branch b
    left outer join Account a
    on a.branchNumber = b.branchNumber
    left outer join Owns o
    on o.accNumber = a.accNumber
    where o.customerID in (select o3.customerID from Owns o3 where o3.accNumber in (select o2.accNumber from Owns o2 where o2.customerID = c.customerID)))
  order by c.customerID asc LIMIT 10;`
}

function problem8() {
  return prisma.$queryRaw`select e.sin, e.firstName, e.lastName, e.salary, b.branchName 
  from Employee e
    left outer join Branch b
    on b.managerSIN = e.sin
    where e.salary > 50000
  order by b.branchName desc, e.firstName asc LIMIT 10;`
}

function problem9() {
  return prisma.$queryRaw`select e.sin, e.firstName, e.lastName, e.salary, if(b.managerSIN = e.sin, b.branchName, null) as "branchName"
  from Branch b, Employee e
    where e.salary > 50000 and b.branchNumber = e.branchNumber
  order by 5 desc, e.firstName asc LIMIT 10;`
}

function problem10() {
  return prisma.$queryRaw`select distinct c.customerID, c.firstName, c.lastName, c.income 
  from Customer c
  where c.income > 5000
  and not exists(select a.branchNumber from Account a left outer join Owns o on a.accNumber = o.accNumber left outer join Customer c2 on o.customerID = c2.customerID where c2.firstName = 'Helen' and c2.lastName = 'Morgan' and a.branchNumber not in (select a2.branchNumber from Account a2 left outer join Owns o2 on a2.accNumber = o2.accNumber where o2.customerID = c.customerID))
  order by c.income desc LIMIT 10;`
}

function problem11() {
  return prisma.$queryRaw`select e2.sin, e2.firstName, e2.lastName, e2.salary from Employee e2, Branch b2 where e2.branchNumber = b2.branchNumber and b2.branchName = 'Berlin' and e2.salary = (select min(e.salary) from Employee e, Branch b where e.branchNumber = b.branchNumber and b.branchName = 'Berlin');`
}

function problem14() {
  return prisma.$queryRaw`select cast(sum(e.salary) as char(10)) as "sum of employees salaries" from Employee e, Branch b where e.branchNumber = b.branchNumber and b.branchName = 'Moscow';`
}

function problem15() {
  return prisma.$queryRaw`select c.customerID, c.firstName, c.lastName from Customer c where (select count(distinct a.branchNumber) from Account a left outer join Owns o on o.accNumber = a.accNumber where o.customerID = c.customerID) = 4 order by c.lastName asc, c.firstName asc LIMIT 10;`
}


function problem17() {
  return prisma.$queryRaw`select c.customerID, c.firstName, c.lastName, c.income, (select avg(a.balance) from Account a left outer join Owns o on o.accNumber = a.accNumber where o.customerID = c.customerID) as "average account balance" from Customer c where (select count(*) from Account a2 left outer join Owns o2 on o2.accNumber = a2.accNumber where o2.customerID = c.customerID) >= 3 and left(c.lastName, 1) = 'S' and instr(c.lastName, 'e') != 0 order by c.customerID asc LIMIT 10;`
}

function problem18() {
  return prisma.$queryRaw`select a.accNumber, a.balance, (select sum(t.amount) from Transactions t where t.accNumber = a.accNumber) as "sum of transaction amounts" from Account a where (select b.branchName from Branch b where b.branchNumber = a.branchNumber) = 'Berlin' and (select count(*) from Transactions t where t.accNumber = a.accNumber) >= 10 order by 3 asc LIMIT 10;`
}

const ProblemList = [
  problem1, problem2, problem3, problem4, problem5, problem6, problem7, problem8, problem9, problem10,
  problem11, problem14, problem15, problem17, problem18
]


async function main() {
  for (let i = 0; i < ProblemList.length; i++) {
    const result = await ProblemList[i]()
    const answer =  JSON.parse(fs.readFileSync(`${ProblemList[i].name}.json`,'utf-8'));
    lodash.isEqual(result, answer) ? console.log(`${ProblemList[i].name}: Correct`) : console.log(`${ProblemList[i].name}: Incorrect`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })