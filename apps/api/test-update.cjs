require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const express = require('express');

async function testUpdate() {
  try {
    const customer = await db.customer.findFirst();
    if (!customer) {
      console.log('No customer found');
      return;
    }
    console.log('Found customer:', customer.id);
    
    // Test update without tags
    const updateData = {
      firstName: "Test"
    };

    const updated = await db.customer.update({
      where: { id: customer.id },
      data: updateData,
      include: { tags: true }
    });
    console.log('Update successful:', updated.id);
  } catch (e) {
    console.error('Update failed:', e);
  } finally {
    await db.$disconnect();
  }
}

testUpdate();
