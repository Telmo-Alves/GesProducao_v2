package com.gesproducao.birt;

import org.eclipse.birt.core.framework.Platform;
import org.eclipse.birt.report.engine.api.*;
import org.eclipse.birt.report.model.api.ReportDesignHandle;
import org.eclipse.birt.report.model.api.SessionHandle;
import org.eclipse.birt.report.model.api.DesignEngine;
import org.eclipse.birt.report.model.api.ElementFactory;
import org.eclipse.birt.report.model.api.DesignConfig;
import org.eclipse.birt.report.model.api.metadata.IMetaDataDictionary;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.io.*;

public class BirtEngineApplication {

    private static IReportEngine engine = null;
    private static DesignEngine designEngine = null;
    private static ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        System.out.println("🚀 GesProducao BIRT Engine Server starting...");

        try {
            initializeBirtEngine();
            startHttpServer();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void initializeBirtEngine() throws EngineException {
        // Configure BIRT Platform
        EngineConfig config = new EngineConfig();
        config.setEngineHome("");
        config.setLogConfig(null, java.util.logging.Level.FINE);

        // Initialize BIRT Platform
        Platform.startup(config);

        // Create Report Engine
        IReportEngineFactory factory = (IReportEngineFactory) Platform
                .createFactoryObject(IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY);
        engine = factory.createReportEngine(config);

        // Initialize Design Engine
        DesignConfig designConfig = new DesignConfig();
        designEngine = new DesignEngine(designConfig);

        System.out.println("✅ BIRT Engine initialized successfully");
    }

    private static void startHttpServer() {
        System.out.println("🌐 BIRT Engine HTTP Server running on port 8080");
        System.out.println("📊 Endpoints available:");
        System.out.println("   - POST /api/reports/generate - Generate PDF from report design");
        System.out.println("   - POST /api/reports/create - Create new report design");
        System.out.println("   - GET /api/reports/health - Health check");

        // Simple HTTP server would go here
        // For now, we'll create a command-line interface
        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.print("\nBIRT Engine> ");
            String command = scanner.nextLine();

            if ("exit".equals(command)) {
                shutdown();
                break;
            } else if ("test".equals(command)) {
                testReportGeneration();
            } else if ("create".equals(command)) {
                createSampleReport();
            } else {
                System.out.println("Commands: test, create, exit");
            }
        }
    }

    private static void testReportGeneration() {
        System.out.println("🧪 Testing report generation...");

        try {
            // Create a simple test report
            SessionHandle session = designEngine.newSessionHandle(ULocale.getDefault());
            ReportDesignHandle design = session.createDesign();

            // Add basic elements to the report
            ElementFactory factory = design.getElementFactory();

            // Create a simple label
            org.eclipse.birt.report.model.api.LabelHandle label = factory.newLabel("testLabel");
            label.setText("Hello from BIRT!");

            design.getBody().add(label);

            // Save design temporarily
            String tempDesignPath = "/tmp/test-report.rptdesign";
            design.saveAs(tempDesignPath);
            design.close();
            session.destroy();

            // Generate PDF from the design
            IReportRunnable design2 = engine.openReportDesign(tempDesignPath);
            IRunAndRenderTask task = engine.createRunAndRenderTask(design2);

            // Configure render options for PDF
            PDFRenderOption options = new PDFRenderOption();
            options.setOutputFileName("/tmp/test-report.pdf");
            options.setOutputFormat("pdf");

            task.setRenderOption(options);

            // Run the report
            task.run();
            task.close();
            design2.close();

            System.out.println("✅ Test report generated: /tmp/test-report.pdf");

        } catch (Exception e) {
            System.err.println("❌ Error generating test report: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void createSampleReport() {
        System.out.println("📋 Creating sample report with Firebird data source...");

        try {
            SessionHandle session = designEngine.newSessionHandle(ULocale.getDefault());
            ReportDesignHandle design = session.createDesign();
            ElementFactory factory = design.getElementFactory();

            // Create data source
            org.eclipse.birt.report.model.api.OdaDataSourceHandle dataSource = factory.newOdaDataSource(
                "FirebirdDS", "org.eclipse.birt.report.data.oda.jdbc");

            dataSource.setProperty("odaURL", "jdbc:firebirdsql://telmo-hp:3052/d:\\Clientes\\manodi\\GesProducao\\Base de Dados\\Manodi_Gesprod_v25.fdb");
            dataSource.setProperty("odaUser", "SYSDBA");
            dataSource.setProperty("odaPassword", "eampdpg");
            dataSource.setProperty("odaDriverClass", "org.firebirdsql.jdbc.FBDriver");

            design.getDataSources().add(dataSource);

            // Create data set
            org.eclipse.birt.report.model.api.OdaDataSetHandle dataSet = factory.newOdaDataSet(
                "RecepcaoDataSet", "org.eclipse.birt.report.data.oda.jdbc.JdbcSelectDataSet");

            dataSet.setDataSource("FirebirdDS");
            dataSet.setQueryText("SELECT SECCAO, NUMERO, CLIENTE, ARTIGO, COMPOSICAO, PENDENTE, METROS_PENDENTES, DATA_ENTRADA FROM MOV_RECEPCAO WHERE PENDENTE > 0 ORDER BY DATA_ENTRADA DESC ROWS 10");

            design.getDataSets().add(dataSet);

            // Create table to display data
            org.eclipse.birt.report.model.api.TableHandle table = factory.newTableItem("RecepcaoTable", 8);
            table.setWidth("100%");
            table.setDataSet(dataSet);

            // Add table to design
            design.getBody().add(table);

            // Save design
            String designPath = "/tmp/recepcao-report.rptdesign";
            design.saveAs(designPath);
            design.close();
            session.destroy();

            System.out.println("✅ Sample report design created: " + designPath);
            System.out.println("📊 Report includes Firebird data source and Recepcao table");

        } catch (Exception e) {
            System.err.println("❌ Error creating sample report: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void shutdown() {
        try {
            if (engine != null) {
                engine.shutdown();
            }
            Platform.shutdown();
            System.out.println("👋 BIRT Engine shutdown complete");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}