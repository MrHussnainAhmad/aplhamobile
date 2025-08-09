// ==================================================
// BACKEND API ROUTES TO ADD TO YOUR SERVER
// ==================================================
// These routes need to be added to your backend server 
// in the routes/admin.js file to support subject management

// Add these imports at the top of your routes/admin.js file if not already present:
// const Teacher = require('../models/Teacher'); // Adjust path as needed

// ==================================================
// 1. GET /admin/teachers-with-classes
// ==================================================
// Get teachers who have assigned classes (for subject management)
router.get('/teachers-with-classes', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Find teachers who have classes assigned and are verified
    const teachers = await Teacher.find({ 
      isVerified: true, 
      classes: { $exists: true, $not: { $size: 0 } } 
    })
    .populate('classes', 'name level')
    .select('fullname email teacherId classes subjects')
    .lean();

    res.json({
      success: true,
      teachers: teachers || []
    });
  } catch (error) {
    console.error('Error fetching teachers with classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers with classes',
      error: error.message
    });
  }
});

// ==================================================
// 2. POST /admin/assign-subject
// ==================================================
// Assign subjects to a teacher
router.post('/assign-subject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { teacherId, subjects } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subjects array is required and cannot be empty'
      });
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId).populate('classes', 'name level');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (!teacher.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Teacher must be verified to assign subjects'
      });
    }

    if (!teacher.classes || teacher.classes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Teacher must have assigned classes before subjects can be assigned'
      });
    }

    // Initialize subjects array if it doesn't exist
    if (!teacher.subjects) {
      teacher.subjects = [];
    }

    // Add new subjects (avoid duplicates)
    const newSubjects = subjects.filter(subject => 
      subject && !teacher.subjects.includes(subject.trim())
    );

    if (newSubjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All provided subjects are already assigned to this teacher'
      });
    }

    teacher.subjects.push(...newSubjects.map(s => s.trim()));
    await teacher.save();

    // Populate the response
    const updatedTeacher = await Teacher.findById(teacherId)
      .populate('classes', 'name level')
      .select('fullname email teacherId classes subjects');

    res.json({
      success: true,
      message: `Successfully assigned ${newSubjects.length} subject(s) to ${teacher.fullname}`,
      teacher: updatedTeacher
    });

  } catch (error) {
    console.error('Error assigning subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign subjects',
      error: error.message
    });
  }
});

// ==================================================
// 3. POST /admin/remove-subject
// ==================================================
// Remove subjects from a teacher
router.post('/remove-subject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { teacherId, subjects } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subjects array is required and cannot be empty'
      });
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId).populate('classes', 'name level');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (!teacher.subjects || teacher.subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Teacher has no subjects assigned'
      });
    }

    // Remove subjects
    const subjectsToRemove = subjects.map(s => s.trim());
    const initialLength = teacher.subjects.length;
    
    teacher.subjects = teacher.subjects.filter(subject => 
      !subjectsToRemove.includes(subject)
    );

    const removedCount = initialLength - teacher.subjects.length;

    if (removedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'None of the specified subjects were found for this teacher'
      });
    }

    await teacher.save();

    // Populate the response
    const updatedTeacher = await Teacher.findById(teacherId)
      .populate('classes', 'name level')
      .select('fullname email teacherId classes subjects');

    res.json({
      success: true,
      message: `Successfully removed ${removedCount} subject(s) from ${teacher.fullname}`,
      teacher: updatedTeacher
    });

  } catch (error) {
    console.error('Error removing subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove subjects',
      error: error.message
    });
  }
});

// ==================================================
// 4. GET /admin/search-verified-teachers (Optional Enhancement)
// ==================================================
// Search verified teachers with optional filters
router.get('/search-verified-teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { 
      search, 
      hasClasses, 
      hasSubjects,
      limit = 50,
      page = 1 
    } = req.query;

    let query = { isVerified: true };

    // Text search across multiple fields
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullname: searchRegex },
        { email: searchRegex },
        { teacherId: searchRegex }
      ];
    }

    // Filter by class assignment
    if (hasClasses === 'true') {
      query.classes = { $exists: true, $not: { $size: 0 } };
    } else if (hasClasses === 'false') {
      query.$or = [
        { classes: { $exists: false } },
        { classes: { $size: 0 } }
      ];
    }

    // Filter by subject assignment
    if (hasSubjects === 'true') {
      query.subjects = { $exists: true, $not: { $size: 0 } };
    } else if (hasSubjects === 'false') {
      query.$or = [
        { subjects: { $exists: false } },
        { subjects: { $size: 0 } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const teachers = await Teacher.find(query)
      .populate('classes', 'name level')
      .select('fullname email teacherId classes subjects')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ fullname: 1 })
      .lean();

    const total = await Teacher.countDocuments(query);

    res.json({
      success: true,
      teachers: teachers || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error searching verified teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search teachers',
      error: error.message
    });
  }
});

// ==================================================
// 5. GET /admin/subjects (Optional)
// ==================================================
// Get all unique subjects across all teachers
router.get('/subjects', requireAuth, requireAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find({ 
      subjects: { $exists: true, $not: { $size: 0 } } 
    }).select('subjects').lean();

    // Extract unique subjects
    const allSubjects = teachers.reduce((acc, teacher) => {
      if (teacher.subjects && Array.isArray(teacher.subjects)) {
        acc.push(...teacher.subjects);
      }
      return acc;
    }, []);

    const uniqueSubjects = [...new Set(allSubjects)].sort();

    res.json({
      success: true,
      subjects: uniqueSubjects
    });

  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
});

// ==================================================
// INSTRUCTIONS FOR IMPLEMENTATION:
// ==================================================
/*
1. Add these routes to your existing routes/admin.js file in your backend server
2. Make sure your Teacher model has a 'subjects' field (Array of Strings)
3. Update your Teacher schema if needed to include:
   subjects: [{
     type: String,
     trim: true
   }]
4. Restart your backend server after adding these routes
5. The frontend should then work properly with subject assignment

IMPORTANT: Replace 'requireAuth' and 'requireAdmin' with your actual middleware function names if they're different.
*/
